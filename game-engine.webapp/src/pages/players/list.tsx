import {useGame} from "../../hooks/use-game";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useState} from "react";
import type {PlayerDto} from "../../api/types";
import type {GetFilter} from "../../api/filters/filters.ts";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {playerClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add, Games} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {PageList} from "../../components/PageList.tsx";
import {Stack, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

export function PlayerListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deletePlayer, setDeletePlayer] = useState<PlayerDto>()
    const [filters, setFilters] = useState<GetFilter<PlayerDto>[]>([])
    const [t] = useTranslation()
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-players", game.id, filters],
        queryFn: () => playerClient.getPlayers(game.id!, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation<unknown, object, { gameId: string, playerId: string }>({
        mutationKey: ["delete-player", game.id],
        mutationFn: (vars) => playerClient.deletePlayer(vars.gameId, vars.playerId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-players", game.id, filters]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("players.deleted.title"),
                    content: t("players.deleted.message")
                },
                isSnack: true
            })
            setDeletePlayer(undefined)
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

    const filter = useDebounced((value: string = "") => {
        setFilters(value ? [{name: "playerId", value}] : [])
    }, 200)

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }


    return <PageContainer>
        <PageHeader
            title={t("players.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/players/upsert`
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
                }
            ]}
        />
        <DeleteDialog message={t("delete_message", {entity: deletePlayer?.playerId})}
                      deleteFn={() => mutate({gameId: game.id!, playerId: deletePlayer?.playerId ?? ""})}
                      setElement={setDeletePlayer}
                      element={deletePlayer}
        />
        <PageList
            items={data?.content ?? []}
            renderItem={(item) => {
                return <Stack>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{item.playerId}</Typography>
                </Stack>
            }}
            itemHref={(item) => {
                return `/games/${game.id}/players/${item.playerId}`
            }}
            onItemDelete={(item) => {
                setDeletePlayer(item)
            }}
            emptyListMessage={t("players.empty_list")}
            search={{
                placeholder: t("search_placeholder"),
                label: t("players.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}