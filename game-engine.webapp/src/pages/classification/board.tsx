import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {classificationClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {
    Box,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import {EmojiEvents, Games, Groups, Leaderboard, Person} from "@mui/icons-material"
import {useState} from "react";
import {useTranslation} from "react-i18next";
import type {GetFilter} from "../../api/filters/filters.ts";
import type {ClassificationBoardDto} from "../../api/types";
import {CLASSIFICATION_SCOPES, type ClassificationScope} from "../../utils/enum-utils.ts";

const LEADERBOARD_PODIUM_COLOURS = {
    1: "gold",
    2: "silver",
    3: "brown"
} as Record<number, string>

type BoardFilters = {
    periodInstanceIndex: number
    scope: ClassificationScope
    page: number
    size: number
}

export function ClassificationBoardPage() {

    const [t] = useTranslation()
    const game = useGame()
    const {classificationId} = useParams()
    const [filters, setFilters] = useState<BoardFilters>({periodInstanceIndex: 0, scope: "PLAYERS", page: 0, size: 10})


    const criteria: GetFilter<ClassificationBoardDto>[] =
        Object.entries(filters).map(([name, value]) => ({name, value: String(value)}))

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-classification-board", game.id, classificationId, filters],
        queryFn: () => classificationClient.getBoard(game.id!, classificationId!, criteria),
        enabled: !!game && !!classificationId,
        placeholderData: keepPreviousData
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/classifications`} replace={true} state={errorMessage}/>
    }

    const isIncremental = data?.type === "INCREMENTAL"
    const rows = data?.board?.content ?? []
    const total = data?.board?.totalElements ?? 0

    return <PageContainer>
        <PageHeader
            title={data?.classificationName ?? t("leaderboards.title")}
            buttons={[
                {
                    children: t("buttons:turn_back"),
                    variant: "contained",
                    href: `/games/${game.id}/classifications`
                }
            ]}
            breadcrumbs={[
                {
                    icon: <Games/>,
                    label: t("sidebar.games"),
                    href: "/dashboard"
                },
                {
                    label: game.name ?? "My Game",
                    href: `/games/${game.id}`
                },
                {
                    label: t("sidebar.classifications"),
                    href: `/games/${game.id}/classifications`,
                    icon: <Leaderboard/>
                }
            ]}
        />
        <Stack sx={{gap: 2, marginTop: 2, minHeight: 0, flex: 1}}>
            <Stack direction={{xs: "column", sm: "row"}}
                   sx={{gap: 2, alignItems: {xs: "flex-start", sm: "center"}, justifyContent: "space-between"}}>
                <Typography
                    color={"text.secondary"}>{t("leaderboards.point_concept")}: {data?.pointConceptName}</Typography>
                <ToggleButtonGroup
                    color={"primary"}
                    exclusive={true}
                    value={filters.scope}
                    onChange={(_, value: ClassificationScope | null) => {
                        if (value !== null) {
                            setFilters(previous => ({...previous, scope: value, page: 0}))
                        }
                    }}
                >
                    {CLASSIFICATION_SCOPES.map((scope) => (
                        <ToggleButton key={scope} value={scope}>{t(`enums:${scope}`)}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            {isIncremental &&
                <TextField
                    type={"number"}
                    label={t("leaderboards.board.period_index")}
                    value={filters.periodInstanceIndex}
                    onChange={(e) => {
                        setFilters(previous => ({
                            ...previous,
                            periodInstanceIndex: Math.max(0, Number(e.target.value) || 0),
                            page: 0
                        }))
                    }}
                    slotProps={{htmlInput: {min: 0}}}
                    sx={{maxWidth: 260}}
                />
            }
            <Box sx={{flex: 1, minHeight: 0, overflow: "auto"}}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>{t("leaderboards.board.player")}</TableCell>
                                <TableCell align={"right"}>{t("leaderboards.board.score")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((p) => (
                                <TableRow key={p.playerId}>
                                    <TableCell sx={{display: "flex", alignItems: "center", gap: 2}}>
                                        {p.position}
                                        {p.position! <= 3 &&
                                            <EmojiEvents sx={{
                                                color: LEADERBOARD_PODIUM_COLOURS[p.position!]
                                            }}/>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
                                            {p.playerId}
                                            {p.team
                                                ? <Groups/>
                                                : <Person/>
                                            }
                                        </Stack>
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        {p.score}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rows.length === 0 &&
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <Box sx={{textAlign: "center", py: 2}}>{t("leaderboards.board.empty")}</Box>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <TablePagination
                component={"div"}
                variant={"footer"}
                count={total}
                page={filters.page}
                onPageChange={(_, newPage) => {
                    setFilters(previous => ({...previous, page: newPage}))
                }}
                rowsPerPage={filters.size}
                onRowsPerPageChange={(e) => {
                    setFilters(previous => ({...previous, size: parseInt(e.target.value, 10), page: 0}))
                }}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
            />
        </Stack>
    </PageContainer>

}
