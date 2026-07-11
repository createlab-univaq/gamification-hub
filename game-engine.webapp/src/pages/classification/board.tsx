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
    Typography,
} from "@mui/material";
import {EmojiEvents} from "@mui/icons-material"
import {useState} from "react";
import {useTranslation} from "react-i18next";
import type {GetFilter} from "../../api/filters/filters.ts";
import type {ClassificationBoardDto} from "../../api/types";

const LEADERBOARD_PODIUM_COLOURS = {
    1: "gold",
    2: "silver",
    3: "brown"
} as Record<number, string>

type BoardFilters = {
    periodInstanceIndex: number
    page: number
    size: number
}

export function ClassificationBoardPage() {

    const [t] = useTranslation()
    const game = useGame()
    const {classificationId} = useParams()
    const [filters, setFilters] = useState<BoardFilters>({periodInstanceIndex: 0, page: 0, size: 10})


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
        />
        <Stack sx={{gap: 2, marginTop: 2, minHeight: 0, flex: 1}}>
            <Typography
                color={"text.secondary"}>{t("leaderboards.point_concept")}: {data?.pointConceptName}</Typography>
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
                                        {p.playerId}
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
