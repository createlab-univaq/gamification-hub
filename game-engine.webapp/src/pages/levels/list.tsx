import {useGame} from "../../hooks/use-game";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {levelClient, queryClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Navigate} from "react-router-dom";
import {Stack, Typography} from "@mui/material";
import {Add, Games} from "@mui/icons-material";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useState} from "react";
import type {LevelDto} from "../../api/types";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import type {GetFilter} from "../../api/filters/filters.ts";
import {useTranslation} from "react-i18next";

export function LevelListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteLevel, setDeleteLevel] = useState<LevelDto>()
    const [filters, setFilters] = useState<GetFilter<LevelDto>[]>([])
    const [t] = useTranslation()
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-levels", game.id, filters],
        queryFn: () => levelClient.getLevels(game.id!, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation<unknown, object, { gameId: string, levelName: string }>({
        mutationKey: ["delete-level", game.id],
        mutationFn: (vars) => levelClient.deleteLevel(vars.gameId, vars.levelName),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-levels", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("levels.saved.title"),
                    content: t("levels.saved.message")
                },
                isSnack: true
            })
            setDeleteLevel(undefined)
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
            title={t("levels.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/levels/upsert`
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
        <DeleteDialog message={t("delete_message", {entity: deleteLevel?.name})}
                      deleteFn={() => mutate({gameId: game.id!, levelName: deleteLevel?.name ?? ""})}
                      setElement={setDeleteLevel}
                      element={deleteLevel}
        />
        <PageList
            items={data ?? []}
            itemHref={(level) => `/games/${game.id}/levels/upsert/${level.name}`}
            renderItem={(level) => {
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{level.name}</Typography>
                    <Typography>{t("levels.thresholds")}: {level.thresholds?.length ?? 0}</Typography>
                </Stack>
            }}
            onItemUpdate={(level, event) => {
                event.stopPropagation()
                event.preventDefault()
                navigateTo(`/games/${game.id}/levels/upsert/${level.name}`)
            }}
            onItemDelete={(level) => {
                setDeleteLevel(level)
            }}
            emptyListMessage={t("levels.empty_list")}
            search={{
                label: t("search_placeholder"),
                placeholder: t("levels.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
