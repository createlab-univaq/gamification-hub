import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {badgeClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Card, CardContent, CardHeader, Chip, Stack, Typography} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {BadgeCollectionDto} from "../../api/types";

export function BadgeDetailsPage() {

    const game = useGame()
    const {badgeId} = useParams()
    const {setNotification} = useNotificationContext()
    const [deleteElement, setDeleteElement] = useState<BadgeCollectionDto>()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-badge", game.id, badgeId],
        queryFn: () => badgeClient.getBadge(game.id, badgeId),
        enabled: !!game && !!badgeId
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ["delete-badge", badgeId],
        mutationFn: (vars) => badgeClient.deleteBadge(vars.gameId, vars.badgeId),
        onSuccess: () => {
            navigateTo(`/games/${game.id}/badges`, {
                state: {
                    type: "success",
                    title: "Collezione eliminata",
                    content: `Collezione di medaglie eliminata con successo!`
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

    return <PageContainer>
        <DeleteDialog message={`Vuoi davvero eliminare la collezione ${data.name}`}
                      deleteFn={() => mutate({gameId: game.id, badgeId: badgeId})}
                      setElement={setDeleteElement}
                      element={deleteElement}
        />
        <PageHeader
            title={data.name}
            buttons={[
                {
                    disabled: isPending,
                    loading: isPending,
                    children: "Modifica",
                    variant: "contained",
                    href: `/games/${game.id}/badges/upsert/${badgeId}`,
                    endIcon: <Edit/>
                },
                {
                    disabled: isPending,
                    loading: isPending,
                    children: "Delete",
                    color: "error",
                    variant: "contained",
                    endIcon: <Delete/>,
                    onClick: () => setDeleteElement(data)
                }
            ]}
        />
        <Stack sx={{gap: 2, py: 2}}>
            <Typography><b>Visibilità:</b> {data.hidden ? "Nascosta" : "Visibile"}</Typography>
            <Card>
                <CardHeader title={`Medaglie (${data.badges?.length ?? 0})`}/>
                <CardContent>
                    <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap"}}>
                        {(data.badges ?? []).map(b => <Chip key={b} label={b}/>)}
                        {!(data.badges ?? []).length && <Typography>Nessuna medaglia definita.</Typography>}
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    </PageContainer>

}
