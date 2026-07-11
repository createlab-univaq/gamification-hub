import {useGame} from "../../hooks/use-game";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useState} from "react";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {pointConceptClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Stack, Typography} from "@mui/material";
import type {PointConceptDto} from "../../api/types";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import type {GetFilter} from "../../api/filters/filters.ts";
import {useTranslation} from "react-i18next";

export function PointConceptListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deletePc, setDeletePc] = useState<PointConceptDto>()
    const [filters, setFilters] = useState<GetFilter<PointConceptDto>[]>([])
    const [t] = useTranslation()
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-pcs", game.id, filters],
        queryFn: () => pointConceptClient.getPointConcepts(game.id!, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation<unknown, Error, { gameId: string, pcId: string }>({
        mutationKey: ["delete-pc", game.id],
        mutationFn: (vars) => pointConceptClient.deletePointConcept(vars.gameId, vars.pcId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-pcs", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("points.deleted.title"),
                    content: t("points.deleted.message")
                },
                isSnack: true
            })
            setDeletePc(undefined)
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
            title={t("points.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/points/upsert`
                }
            ]}
        />
        <DeleteDialog message={t("delete_message", {entity: deletePc?.name})}
                      deleteFn={() => mutate({gameId: game.id!, pcId: deletePc!.id!})}
                      setElement={setDeletePc}
                      element={deletePc}
        />
        <PageList
            items={data ?? []}
            renderItem={(item) => {
                const periodNumber = Array.from(Object.values(item.periods!)).length
                return <Stack>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{item.name}</Typography>
                    <Typography>{t("points.periods_count", {count: periodNumber})}</Typography>
                </Stack>
            }}
            itemHref={(item) => {
                return `/games/${game.id}/points/${item.id}`
            }}
            onItemUpdate={(item, event) => {
                event.stopPropagation()
                event.preventDefault()
                navigateTo(`/games/${game.id}/points/upsert/${item.id}`)
            }}
            onItemDelete={(item) => {
                setDeletePc(item)
            }}
            emptyListMessage={<Typography>{t("points.empty_list")}</Typography>}
            search={{
                placeholder: t("points.search_placeholder"),
                label: t("search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}