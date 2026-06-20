import {useGame} from "../../components/GameContext.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useState} from "react";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {actionClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import type {ActionDto} from "../../api/types";
import type {GetFilter} from "../../api/filters/filters.ts";

export function ActionListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteAction, setDeleteAction] = useState<string>()
    const [filters, setFilters] = useState<GetFilter<ActionDto>[]>([])
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-actions", game.id, filters],
        queryFn: () => actionClient.getActions(game.id, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-action", game.id],
        mutationFn: (vars) => actionClient.deleteAction(vars.gameId, vars.actionId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-actions", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Azione Eliminata",
                    content: `L'azione è stata eliminata con successo`
                },
                isSnack: true
            })
            setDeleteAction(undefined)
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
        setFilters(value ? [{name: "name", value}] : [])
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
            title={"Azioni"}
            buttons={[
                {
                    children: "Aggiungi",
                    variant: "contained",
                    endIcon: <Add/>,
                    href:`/games/${game.id}/actions/upsert`
                }
            ]}
        />
        <DeleteDialog message={`Vuoi davvero eliminare l'azione "${deleteAction}" per sempre?`}
                      deleteFn={() => mutate({gameId: game.id, actionId: deleteAction})}
                      setElement={setDeleteAction}
                      element={deleteAction}
        />
        <PageList
            items={data ?? []}
            itemHref={(i)=>{
                return `/games/${game.id}/actions/upsert/${i.name}`
            }}
            renderItem={(action)=>{
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{action.name}</Typography>
                </Stack>
            }}
            onItemUpdate={()=>{}}
            onItemDelete={(action)=>{
                setDeleteAction(action.name)
            }}
            emptyListMessage={"Nessun'azione trovata."}
            search={{
                label:"Cerca",
                placeholder:"Azione...",
                onSearch:(value)=>{
                    filter(value)
                }
            }}
        />
    </PageContainer>

}