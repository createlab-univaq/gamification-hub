import {useGame} from "../../components/GameContext.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {challengeClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Chip, Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import type {ChallengeDto} from "../../api/types";

export function ChallengeListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteChallenge, setDeleteChallenge] = useState<ChallengeDto>()
    const [search, setSearch] = useState<string>("")

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-challenges", game.id],
        queryFn: () => challengeClient.getChallenges(game.id),
        enabled: !!game
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-challenge", game.id],
        mutationFn: (challengeId: string) => challengeClient.deleteChallenge(game.id, challengeId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-challenges", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Modello di sfida eliminato",
                    content: `Il modello di sfida è stato eliminato con successo`
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
            title={"Modelli di sfida"}
            buttons={[
                {
                    children: "Aggiungi",
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/challenges/upsert`
                }
            ]}
        />
        <DeleteDialog message={`Vuoi davvero eliminare il modello di sfida "${deleteChallenge?.name}" per sempre?`}
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
            onItemUpdate={() => {}}
            onItemDelete={(challenge) => {
                setDeleteChallenge(challenge)
            }}
            emptyListMessage={"Nessun modello di sfida trovato."}
            search={{
                label: "Cerca",
                placeholder: "Modello...",
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
