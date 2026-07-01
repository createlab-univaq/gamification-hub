import {useGame} from "../../components/GameContext.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useState} from "react";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {queryClient, scenarioClient} from "../../api";
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
import type {SimulationScenarioDto} from "../../api/types";
import type {GetFilter} from "../../api/filters/filters.ts";

export function ScenarioListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteScenario, setDeleteScenario] = useState<SimulationScenarioDto>()
    const [filters, setFilters] = useState<GetFilter<SimulationScenarioDto>[]>([])
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-scenarios", game.id, filters],
        queryFn: () => scenarioClient.getScenarios(game.id, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-scenario", game.id],
        mutationFn: (vars) => scenarioClient.deleteScenario(vars.gameId, vars.scenarioId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-scenarios", game.id, filters]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Scenario Eliminato",
                    content: "Lo scenario è stato eliminato con successo"
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
            title={"Scenari"}
            buttons={[
                {
                    children: "Aggiungi",
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/scenarios/upsert`
                }
            ]}
        />
        <DeleteDialog message={`Vuoi davvero eliminare lo scenario "${deleteScenario?.name}" per sempre?`}
                      deleteFn={() => mutate({gameId: game.id, scenarioId: deleteScenario.id})}
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
            onItemDelete={(scenario) => setDeleteScenario(scenario)}
            emptyListMessage={<Typography>Nessuno scenario salvato.</Typography>}
            search={{
                label: "Cerca",
                placeholder: "Nome...",
                onSearch: (value) => filter(value)
            }}
        />
    </PageContainer>

}
