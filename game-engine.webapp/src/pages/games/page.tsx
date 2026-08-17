import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../hooks/use-game";
import type {GridSize} from "@mui/material";
import {Grid, Stack, Typography} from "@mui/material";
import {LinkCard} from "../../components/LinkCard.tsx";
import {Delete, Download, Edit, Games, PlayArrow, Refresh} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useMutation} from "@tanstack/react-query";
import {gameClient, queryClient} from "../../api";
import {gameQueryKey} from "../../components/GameContext.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {GAME_STORAGE_KEY} from "../../utils/storage-utils.ts";
import {downloadJson} from "../../utils/download-utils.ts";
import {useState} from "react";
import type {GameDto} from "../../api/types";
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {StatusDot} from "../../components/StatusDot.tsx";
import {useTranslation} from "react-i18next";
import {formatDate} from "../../utils/date-utils.ts";

interface GameConceptGridElementProps {
    href: string,
    title: string,
    content: string,
    size?: GridSize
}

function GameConceptGridElement({content, href, title, size}: GameConceptGridElementProps) {
    return <Grid size={size ?? 1}>
        <LinkCard href={href} title={title}>
            <Typography>{content}</Typography>
        </LinkCard>
    </Grid>
}

export function GamePage() {

    const game = useGame()
    const user = getCurrentUser()
    const {setNotification} = useNotificationContext()
    const [deleteElement, setDeleteElement] = useState<GameDto>()
    const [t] = useTranslation()

    // The game is cached for the session, so an edit made elsewhere needs an explicit
    // refresh to show up here and in everything that reads the game from context.
    const {mutate: refresh, isPending: isRefreshing} = useMutation({
        mutationKey: ["refresh-game", game.id],
        mutationFn: () => queryClient.invalidateQueries({queryKey: gameQueryKey(game.id)})
    })

    const {mutate: exportGame, isPending: isExporting} = useMutation({
        mutationKey: ["export-game", game.id],
        mutationFn: () => gameClient.exportGame(game.id!),
        onSuccess: (data) => {
            downloadJson(`${game.name ?? game.id}.json`, [data])
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({
                notification: translateApiErrorToNotification(apiError),
                isSnack: true
            })
        }
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-game"],
        mutationFn: (gameId: string) => gameClient.deleteGame(gameId),
        onSuccess: () => {
            // Remove cached game
            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({}))
            navigateTo("/dashboard", {
                state: {
                    type: "success",
                    title: t("game.deleted.title"),
                    content: t("game.deleted.message")
                }
            })
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({
                notification: translateApiErrorToNotification(apiError),
                isSnack: true
            })
        }
    })

    return <PageContainer>
        <PageHeader
            title={
                <Stack direction={"row"} sx={{alignItems: "center", gap: 2}}>
                    <Typography variant={"h4"}>{game.name}</Typography>
                    <StatusDot size={"1.5rem"}
                               title={game.terminated ? t("game.is_expired_label") : t("game.is_not_expired_label")}
                               type={!game.terminated ? "success" : "error"}/>
                </Stack>
            }
            breadcrumbs={[
                {
                    label: "Games",
                    icon: <Games/>,
                    href: "/dashboard"
                }
            ]}
            buttons={[
                {
                    endIcon: <PlayArrow/>,
                    children: t("buttons:simulate"),
                    href: `/games/${game.id}/simulate`,
                    variant: "contained"
                },
                {
                    endIcon: <Edit/>,
                    children: t("buttons:update"),
                    href: `/upsert-game/${game.id}`,
                    variant: "contained"
                },
                {
                    endIcon: <Refresh/>,
                    children: t("buttons:refresh"),
                    variant: "outlined",
                    loading: isRefreshing,
                    onClick: () => refresh()
                },
                {
                    endIcon: <Download/>,
                    children: t("buttons:export"),
                    variant: "outlined",
                    loading: isExporting,
                    onClick: () => exportGame()
                },
                {
                    endIcon: <Delete/>,
                    children: t("buttons:delete"),
                    variant: "contained",
                    color: "error",
                    onClick: () => setDeleteElement(game)
                }
            ]}
        />
        <DeleteDialog message={t("delete_message", {entity: deleteElement?.name})}
                      deleteFn={() => mutate(deleteElement?.id ?? "")}
                      setElement={setDeleteElement}
                      element={deleteElement}
        />
        <Stack sx={{marginY: 2}}>
            {user?.id === game.owner && <Typography>{t("game.owner")}: {user?.username}</Typography>}
            <Typography>{t("game.domain")}: {game.domain}</Typography>
            {!!game.expiration && <Typography>{t("game.expiration")}: {formatDate(game.expiration)}</Typography>}
        </Stack>
        <Grid container={true} columns={{
            md: 3,
            lg: 3,
            sm: 1,
            xs: 1
        }} spacing={"2rem"}
        >
            <GameConceptGridElement size={1.5} href={`/games/${game.id}/rules`} title={t("sidebar.rules")}
                                    content={t("total_amount", {
                                        entity: t("sidebar.rules"),
                                        number: game.rules?.length ?? 0
                                    })}/>
            <GameConceptGridElement size={1.5} href={`/games/${game.id}/actions`} title={t("sidebar.actions")}
                                    content={t("total_amount", {
                                        entity: t("sidebar.actions"),
                                        number: game.actions?.length ?? 0
                                    })}/>
            <GameConceptGridElement href={`/games/${game.id}/points`} title={t("sidebar.points")}
                                    content={t("total_amount", {
                                        entity: t("sidebar.points"),
                                        number: game.concepts?.filter(concept => "score" in concept).length ?? 0
                                    })}
            />
            <GameConceptGridElement href={`/games/${game.id}/badges`} title={t("sidebar.badges")}
                                    content={t("total_amount", {
                                        entity: t("sidebar.badges"),
                                        number: game.concepts?.filter(concept => "icon" in concept || "badgeEarned" in concept).length ?? 0
                                    })}
            />
            <GameConceptGridElement href={`/games/${game.id}/classifications`} title={t("sidebar.classifications")}
                                    content={t("total_amount", {
                                        entity: t("sidebar.classifications"),
                                        number: game.tasks?.length ?? 0
                                    })}
            />
        </Grid>
    </PageContainer>

}