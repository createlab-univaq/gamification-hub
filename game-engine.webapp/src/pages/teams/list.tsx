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
import {Add, Games} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import type {TeamDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {navigateTo} from "../../utils/navigation-utils.ts";

export function TeamListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteTeam, setDeleteTeam] = useState<TeamDto>()
    const [search, setSearch] = useState<string>("")
    const [t] = useTranslation()

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
                    title: t("teams.deleted.title"),
                    content: t("teams.deleted.message")
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
            title={t("teams.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/teams/upsert`
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
        <DeleteDialog message={t("delete_message", {entity: deleteTeam?.name ?? deleteTeam?.id})}
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
                    <Typography>{t("teams.members_count", {count: team.members?.length ?? 0})}</Typography>
                </Stack>
            }}
            onItemUpdate={(team) => {
                navigateTo(`/games/${game.id}/teams/upsert/${team.id}`)
            }}
            onItemDelete={(team) => {
                setDeleteTeam(team)
            }}
            emptyListMessage={t("teams.empty_list")}
            search={{
                label: t("search_placeholder"),
                placeholder: t("teams.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
