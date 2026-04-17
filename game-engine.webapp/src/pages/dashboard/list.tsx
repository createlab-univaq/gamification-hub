import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {Button, Card, Stack, Typography} from "@mui/material";
import {useMutation, useQuery} from "@tanstack/react-query";
import {gameClient, queryClient} from "../../api";
import {Add, Delete, Edit, PanoramaFishEye} from "@mui/icons-material"
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {GameDto} from "../../api/types";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";

export function GamesListPage() {

    const {setNotification} = useNotificationContext()

    const {isPending, data} = useQuery({
        queryKey: ["get-list"],
        queryFn: () => gameClient.getGames(),
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-game"],
        mutationFn: (gameId) => gameClient.deleteGame(gameId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-list"]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Game deleted",
                    content: `The game has been successfully deleted`
                },
                isSnack: true
            })
            setDeleteGame(undefined)
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

    const [deleteGame, setDeleteGame] = useState<GameDto>()

    if (isPending) {
        return <></>
    }

    return <PageContainer>
        <PageHeader title={"Your games"}
                    buttons={[
                        {
                            children: <>Add <Add/></>,
                            href: "/upsert-game",
                            variant: "contained"
                        }
                    ]}
        />
        <DeleteDialog message={`Do you want to delete the game "${deleteGame?.name}" forever?`}
                      deleteFn={() => mutate(deleteGame.id)}
                      setElement={setDeleteGame}
                      element={deleteGame}
        />
        {!data.length && <Typography>No games found.</Typography>}
        <Stack sx={{gap: 2, mt: 2}}>
            {data.map((game) => {
                return <Card key={`game-card-${game.id}`}
                             sx={{
                                 padding: 2,
                                 cursor: "pointer",
                                 "&:hover":{
                                     boxShadow:"0rem 0rem 1rem gray"
                                 }
                             }}
                             onClick={() => navigateTo(`/games/${game.id}/`)}
                >
                    <Stack direction={"row"} sx={{justifyContent: "space-between"}}>
                        <Stack>
                            <Typography variant={"h5"}>{game.name}</Typography>
                            <Typography variant={"body1"}>{game.domain}</Typography>
                        </Stack>
                        <Stack direction={"row"}>
                            <Button href={`/games/${game.id}`}><PanoramaFishEye sx={{fontSize: "2rem"}}/></Button>
                            <Button href={`/upsert-game/${game.id}`}><Edit sx={{fontSize: "2rem"}}/></Button>
                            <Button color={"error"} onClick={(event) => {
                                event.stopPropagation()
                                event.preventDefault()
                                setDeleteGame(game)
                            }}><Delete
                                sx={{fontSize: "2rem", color: (theme) => theme.palette.error.main}}/></Button>
                        </Stack>
                    </Stack>
                </Card>
            })}
        </Stack>
    </PageContainer>

}