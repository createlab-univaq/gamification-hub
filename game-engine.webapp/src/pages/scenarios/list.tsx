import {useGame} from "../../hooks/use-game";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useState} from "react";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {queryClient, scenarioClient} from "../../api";
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
import type {SimulationScenarioDto} from "../../api/types";
import type {GetFilter} from "../../api/filters/filters.ts";
import {useTranslation} from "react-i18next";

export function ScenarioListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteScenario, setDeleteScenario] = useState<SimulationScenarioDto>()
    const [filters, setFilters] = useState<GetFilter<SimulationScenarioDto>[]>([])
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-scenarios", game.id, filters],
        queryFn: () => scenarioClient.getScenarios(game.id!, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation<unknown, object, { gameId: string, scenarioId: string }>({
        mutationKey: ["delete-scenario", game.id],
        mutationFn: (vars) => scenarioClient.deleteScenario(vars.gameId, vars.scenarioId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-scenarios", game.id, filters]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("scenarios.deleted.title"),
                    content: t("scenarios.deleted.message")
                },
                isSnack: true
            })
            setDeleteScenario(undefined)
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
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
            title={t("scenarios.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/scenarios/upsert`
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
        <DeleteDialog message={t("delete_message", {entity: deleteScenario?.name})}
                      deleteFn={() => mutate({gameId: game.id!, scenarioId: deleteScenario?.id ?? ""})}
                      setElement={setDeleteScenario}
                      element={deleteScenario}
        />
        <PageList
            items={data ?? []}
            itemHref={(scenario) => `/games/${game.id}/scenarios/upsert/${scenario.id}`}
            renderItem={(scenario) => (
                <Stack>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{scenario.name}</Typography>
                </Stack>
            )}
            onItemUpdate={() => {
            }}
            onItemDelete={(scenario) => setDeleteScenario(scenario)}
            emptyListMessage={<Typography>{t("scenarios.empty_list")}</Typography>}
            search={{
                label: t("search_placeholder"),
                placeholder: t("scenarios.search_placeholder"),
                onSearch: (value) => filter(value)
            }}
        />
    </PageContainer>

}
