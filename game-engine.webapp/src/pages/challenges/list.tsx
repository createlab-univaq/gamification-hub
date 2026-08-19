import {useGame} from "../../hooks/use-game";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {challengeClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add, Games} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Chip, Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import type {ChallengeDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {navigateTo} from "../../utils/navigation-utils.ts";

export function ChallengeListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteChallenge, setDeleteChallenge] = useState<ChallengeDto>()
    const [search, setSearch] = useState<string>("")
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-challenges", game.id],
        queryFn: () => challengeClient.getChallenges(game.id!),
        enabled: !!game
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-challenge", game.id],
        mutationFn: (challengeId: string) => challengeClient.deleteChallenge(game.id!, challengeId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-challenges", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("challenges.saved.title"),
                    content: t("challenges.saved.messages")
                },
                isSnack: true
            })
            setDeleteChallenge(undefined)
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

    const challenges = (data ?? []).filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))

    return <PageContainer>
        <PageHeader
            title={t("challenges.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/challenges/upsert`
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
        <DeleteDialog message={t("delete_message", {entity: deleteChallenge?.name})}
                      deleteFn={() => mutate(deleteChallenge!.id!)}
                      setElement={setDeleteChallenge}
                      element={deleteChallenge}
        />
        <PageList
            items={challenges}
            itemHref={(i) => `/games/${game.id}/challenges/upsert/${i.id}`}
            renderItem={(challenge) => {
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{challenge.name}</Typography>
                    <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap"}}>
                        {(challenge.variables ?? []).map(v => <Chip key={v} label={v} size={"small"}/>)}
                    </Stack>
                </Stack>
            }}
            onItemUpdate={(challenge) => {
                navigateTo(`/games/${game.id}/challenges/upsert/${challenge.id}`)
            }}
            onItemDelete={(challenge) => {
                setDeleteChallenge(challenge)
            }}
            emptyListMessage={t("challenges.empty_list")}
            search={{
                label: t("search_placeholder"),
                placeholder: t("challenges.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
