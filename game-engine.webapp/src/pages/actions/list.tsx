import {useState} from "react";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {actionClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add, Games} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import type {ActionDto} from "../../api/types";
import type {GetFilter} from "../../api/filters/filters.ts";
import {useTranslation} from "react-i18next";
import {useGame} from "../../hooks/use-game";
import {useNotificationContext} from "../../hooks/use-notification-context.ts";

type DeleteActionType = {
    gameId: string;
    actionId: string;
}

export function ActionListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const [deleteAction, setDeleteAction] = useState<string>()
    const [filters, setFilters] = useState<GetFilter<ActionDto>[]>([])
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-actions", game.id, filters],
        queryFn: () => actionClient.getActions(game.id!, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation<unknown, object, DeleteActionType>({
        mutationKey: ["delete-action", game.id],
        mutationFn: (vars) => actionClient.deleteAction(vars.gameId, vars.actionId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-actions", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("actions.deleted_title"),
                    content: t("actions.deleted_message")
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
            title={t("actions.list_title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/actions/upsert`
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
        <DeleteDialog message={t("delete_message", {entity: deleteAction})}
                      deleteFn={() => mutate({gameId: game.id!, actionId: deleteAction ?? ""})}
                      setElement={setDeleteAction}
                      element={deleteAction}
        />
        <PageList
            items={data ?? []}
            itemHref={(i) => {
                return `/games/${game.id}/actions/upsert/${i.name}`
            }}
            renderItem={(action) => {
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{action.name}</Typography>
                </Stack>
            }}
            onItemUpdate={() => {
            }}
            onItemDelete={(action) => {
                setDeleteAction(action.name)
            }}
            emptyListMessage={t("actions.empty_list")}
            search={{
                label: t("search_placeholder"),
                placeholder: t("actions.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}