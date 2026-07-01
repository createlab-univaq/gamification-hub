import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {playerClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Card, CardContent, Chip, Stack, Typography} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {PlayerStateDto} from "../../api/types";

export function PlayerDetailsPage() {

    const game = useGame()
    const {playerId} = useParams()
    const {setNotification} = useNotificationContext()
    const [deleteElement, setDeleteElement] = useState<PlayerStateDto>()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-player", game.id, playerId],
        queryFn: () => playerClient.getPlayer(game.id, playerId),
        enabled: !!game && !!playerId
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ["delete-player", playerId],
        mutationFn: ({gameId, playerId}) => playerClient.deletePlayer(gameId, playerId),
        onSuccess: () => {
            navigateTo(`/games/${game.id}/players`, {
                state: {
                    type: "success",
                    title: "Giocatore Eliminato",
                    content: "Il giocatore è stato eliminato con successo"
                }
            })
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    const pointConcepts = data.pointConcepts ?? []
    const badges = data.badgeCollections ?? []
    const challenges = data.challenges ?? []

    return <PageContainer>
        <DeleteDialog message={`Vuoi davvero eliminare il giocatore "${data.playerId}"?`}
                      deleteFn={() => mutate({gameId: game.id, playerId: data.playerId})}
                      setElement={setDeleteElement}
                      element={deleteElement}
        />
        <PageHeader
            title={data.playerId}
            buttons={[
                {
                    disabled: isPending,
                    loading: isPending,
                    children: "Elimina",
                    color: "error",
                    variant: "contained",
                    endIcon: <Delete/>,
                    onClick: () => setDeleteElement(data)
                }
            ]}
        />
        <Stack sx={{gap: 3, py: 2}}>
            <Stack sx={{gap: 1}}>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>Punteggi</Typography>
                {pointConcepts.length
                    ? <Stack direction={"row"} sx={{gap: 2, flexWrap: "wrap"}}>
                        {pointConcepts.map(pc => (
                            <Card key={`pc-${pc.name}`} variant={"outlined"}>
                                <CardContent>
                                    <Typography sx={{fontWeight: "bold"}}>{pc.name}</Typography>
                                    <Typography variant={"h5"}>{pc.score ?? 0}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>Nessun punteggio.</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>Badge</Typography>
                {badges.length
                    ? <Stack sx={{gap: 1}}>
                        {badges.map(b => (
                            <Card key={`badge-${b.name}`} variant={"outlined"}>
                                <CardContent>
                                    <Typography sx={{fontWeight: "bold"}}>{b.name}</Typography>
                                    <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap", mt: 1}}>
                                        {(b.badges ?? []).map(badge => <Chip key={badge} label={badge} size={"small"}/>)}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>Nessun badge.</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>Sfide</Typography>
                {challenges.length
                    ? <Stack sx={{gap: 1}}>
                        {challenges.map((c, i) => (
                            <Card key={`ch-${c.name}-${i}`} variant={"outlined"}>
                                <CardContent>
                                    <Typography sx={{fontWeight: "bold"}}>{c.name}</Typography>
                                    <Typography color={"text.secondary"}>{c.modelName} — {c.state}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>Nessuna sfida.</Typography>}
            </Stack>
        </Stack>
    </PageContainer>

}
