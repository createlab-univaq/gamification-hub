import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {Button, Stack, Typography} from "@mui/material";
import {useMutation, useQuery} from "@tanstack/react-query";
import {gameClient, queryClient} from "../../api";
import {Add, Delete, Edit, Upload} from "@mui/icons-material"
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {GameDto} from "../../api/types";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {LinkCard} from "../../components/LinkCard.tsx";
import {Loading} from "../../components/Loading.tsx";
import {ImportGameModal} from "../../components/ImportGameModal.tsx";

export function GamesListPage() {

    const {setNotification} = useNotificationContext()
    const [importModalOpen, setImportModalOpen] = useState(false)

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
        return <Loading fullScreen={true}/>
    }


    return <PageContainer>
        <PageHeader title={"Your games"}
                    buttons={[
                        {
                            children: "Add",
                            href: "/upsert-game",
                            variant: "contained",
                            endIcon: <Add/>
                        },
                        {
                            children: "Import",
                            variant: "contained",
                            endIcon: <Upload/>,
                            onClick:()=>setImportModalOpen(true)
                        }
                    ]}
        />
        <DeleteDialog message={`Do you want to delete the game "${deleteGame?.name}" forever?`}
                      deleteFn={() => mutate(deleteGame.id)}
                      setElement={setDeleteGame}
                      element={deleteGame}
        />
        <ImportGameModal
            open={importModalOpen}
            setOpen={setImportModalOpen}
            onSuccess={(data)=>{
                setNotification({
                    notification:{
                        title:"Import successful!",
                        content:`${data.length} were successfully saved.`,
                        type:"success"
                    },
                    isSnack:true
                })
                queryClient.invalidateQueries({queryKey: ["get-list"]})
            }}
            onError={(error)=>setNotification(translateApiErrorToNotification(getApiError(error)))}
        />
        {!data || !data.length && <Typography>No games found.</Typography>}
        {data && <Stack sx={{gap: 2, mt: 2}}>
            {data.map((game) => {
                return <LinkCard key={`game-card-${game.id}`} href={`/games/${game.id}`}>
                    <Stack direction={"row"} sx={{justifyContent: "space-between"}}>
                        <Stack>
                            <Typography variant={"h5"}>{game.name}</Typography>
                            <Typography variant={"body1"}>{game.domain}</Typography>
                        </Stack>
                        <Stack direction={"row"}>
                            <Button href={`/upsert-game/${game.id}`}><Edit sx={{fontSize: "2rem"}}/></Button>
                            <Button color={"error"} onClick={(event) => {
                                event.stopPropagation()
                                event.preventDefault()
                                setDeleteGame(game)
                            }}><Delete
                                sx={{fontSize: "2rem", color: (theme) => theme.palette.error.main}}/></Button>
                        </Stack>
                    </Stack>
                </LinkCard>
            })}
        </Stack>
        }
    </PageContainer>

}