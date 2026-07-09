import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useMutation, useQuery} from "@tanstack/react-query";
import {pointConceptClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Card, CardContent, CardHeader, Stack, Typography} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {formatDate, formatMilliseconds} from "../../utils/date-utils.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {PointConceptDto} from "../../api/types";

export function PointConceptDetailsPage() {

    const game = useGame()
    const {pcId} = useParams()
    const {setNotification} = useNotificationContext()
    const [deleteElement, setDeleteElement] = useState<PointConceptDto>()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-pc", pcId],
        queryFn: () => pointConceptClient.getPointConcept(game.id!, pcId!),
        enabled: !!game && !!pcId
    })

    const {mutate, isPending} = useMutation<unknown, Error, {gameId:string, pcId:string}>({
        mutationKey: ["delete-pc", pcId],
        mutationFn: ({gameId, pcId}) => pointConceptClient.deletePointConcept(gameId, pcId),
        onSuccess: () => {
            navigateTo(`/games/${game.id}/points`, {
                state: {
                    type: "success",
                    title: "Punteggio Eliminato",
                    content: `Punteggio eliminato con successo!`
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

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <DeleteDialog message={`Vuoi davvero eliminare il punteggio ${data?.name}`}
                      deleteFn={() => mutate({gameId: game.id!, pcId: pcId!})}
                      setElement={setDeleteElement}
                      element={deleteElement}
        />
        <PageHeader
            title={data?.name}
            buttons={[
                {
                    disabled: isPending,
                    loading: isPending,
                    children: "Modifica",
                    variant: "contained",
                    href: `/games/${game.id}/points/upsert/${pcId}`,
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
        <Stack
            sx={{
                gap: 2,
                py: 2
            }}
            direction={{
                md: "row",
                lg: "row"
            }}
        >
            {Array.from(Object.values(data!.periods!)).map(period => {
                return <Card key={`period-${period.identifier}`}>
                    <CardHeader title={period.identifier}/>
                    <CardContent>
                        <Stack sx={{gap: 2}}>
                            <Typography>Valido
                                da: <b>{formatDate(period.start!)}</b> a <b>{formatDate(period.end!)}</b></Typography>
                            <Typography><b>Durata:</b> {formatMilliseconds(period.period!)}</Typography>
                            <Typography><b>Istanze mantenute:</b> {period.capacity}</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            })}
            {!Array.from(Object.values(data!.periods!)).length && <Typography>Nessun periodo definito.</Typography>}
        </Stack>
    </PageContainer>

}