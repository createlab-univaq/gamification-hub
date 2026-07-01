import {useGame} from "../../components/GameContext.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
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
import {Add} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {PageList} from "../../components/PageList.tsx";
import {Stack, Typography} from "@mui/material";

export function PlayerListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deletePlayer, setDeletePlayer] = useState<PlayerDto>()
    const [filters, setFilters] = useState<GetFilter<PlayerDto>[]>([])
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-players", game.id, filters],
        queryFn: () => playerClient.getPlayers(game.id, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-player", game.id],
        mutationFn: (vars) => playerClient.deletePlayer(vars.gameId, vars.playerId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-players", game.id, filters]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Giocatore Eliminato",
                    content: `Il giocatore è stato eliminato con successo`
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
            title={"Giocatori"}
            buttons={[
                {
                    children: "Aggiungi",
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/players/upsert`
                }
            ]}
        />
        <DeleteDialog message={`Vuoi davvero eliminare il giocatore "${deletePlayer?.playerId}" per sempre?`}
                      deleteFn={() => mutate({gameId: game.id, playerId: deletePlayer.playerId})}
                      setElement={setDeletePlayer}
                      element={deletePlayer}
        />
        <PageList
            items={data.content ?? []}
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
            emptyListMessage={<Typography>Nessun giocatore iscritto.</Typography>}
            search={{
                placeholder: "Nome...",
                label: "Cerca",
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}