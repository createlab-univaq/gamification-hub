import {useGame} from "../../components/GameContext.tsx";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {levelClient, queryClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Navigate} from "react-router-dom";
import {Stack, Typography} from "@mui/material";
import {Add} from "@mui/icons-material";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useState} from "react";
import type {LevelDto} from "../../api/types";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import type {GetFilter} from "../../api/filters/filters.ts";

export function LevelListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteLevel, setDeleteLevel] = useState<LevelDto>()
    const [filters, setFilters] = useState<GetFilter<LevelDto>[]>([])
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-levels", game.id, filters],
        queryFn: () => levelClient.getLevels(game.id, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-level", game.id],
        mutationFn: (vars) => levelClient.deleteLevel(vars.gameId, vars.levelName),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-levels", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Livello Eliminato",
                    content: `Il livello è stato eliminato con successo`
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
            title={"Livelli"}
            buttons={[
                {
                    children: "Aggiungi",
                    variant:"contained",
                    endIcon: <Add/>,
                    href:`/games/${game.id}/levels/upsert`
                }
            ]}
        />
        <DeleteDialog message={`Vuoi davvero eliminare il livello "${deleteLevel?.name}" per sempre?`}
                      deleteFn={() => mutate({gameId: game.id, levelName: deleteLevel.name})}
                      setElement={setDeleteLevel}
                      element={deleteLevel}
        />
        <PageList
            items={data ?? []}
            itemHref={(level) => `/games/${game.id}/levels/upsert/${level.name}`}
            renderItem={(level) => {
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{level.name}</Typography>
                    <Typography>Soglie: {level.thresholds?.length ?? 0}</Typography>
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
            emptyListMessage={<Typography>Nessun livello trovato.</Typography>}
            search={{
                label: "Cerca",
                placeholder: "Livello...",
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
