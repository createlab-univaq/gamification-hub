import {useGame} from "../../hooks/use-game";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient, teamClient} from "../../api";
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
import type {TeamDto} from "../../api/types";

export function TeamListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteTeam, setDeleteTeam] = useState<TeamDto>()
    const [search, setSearch] = useState<string>("")

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-teams", game.id],
        queryFn: () => teamClient.getTeams(game.id!),
        enabled: !!game
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-team", game.id],
        mutationFn: (teamId: string) => teamClient.deleteTeam(game.id!, teamId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-teams", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Squadra eliminata",
                    content: `La squadra è stata eliminata con successo`
                },
                isSnack: true
            })
            setDeleteTeam(undefined)
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    const filter = useDebounced((value: string = "") => {
        setSearch(value)
    }, 200)

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    const teams = (data ?? []).filter(t =>
        (t.name ?? "").toLowerCase().includes(search.toLowerCase())
        || (t.id ?? "").toLowerCase().includes(search.toLowerCase()))

    return <PageContainer>
        <PageHeader
            title={"Squadre"}
            buttons={[
                {
                    children: "Aggiungi",
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/teams/upsert`
                }
            ]}
        />
        <DeleteDialog message={`Vuoi davvero eliminare la squadra "${deleteTeam?.name ?? deleteTeam?.id}" per sempre?`}
                      deleteFn={() => mutate(deleteTeam!.id!)}
                      setElement={setDeleteTeam}
                      element={deleteTeam}
        />
        <PageList
            items={teams}
            itemHref={(i) => `/games/${game.id}/teams/upsert/${i.id}`}
            renderItem={(team) => {
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{team.name ?? team.id}</Typography>
                    <Typography>Membri: {team.members?.length ?? 0}</Typography>
                </Stack>
            }}
            onItemUpdate={() => {
            }}
            onItemDelete={(team) => {
                setDeleteTeam(team)
            }}
            emptyListMessage={"Nessuna squadra trovata."}
            search={{
                label: "Cerca",
                placeholder: "Squadra...",
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
