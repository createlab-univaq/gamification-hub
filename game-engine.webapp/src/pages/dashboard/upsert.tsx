import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {gameClient} from "../../api";
import {GameForm} from "../../components/form/GameForm.tsx";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {Stack} from "@mui/material";

export function GameUpsertPage() {

    const {gameId} = useParams()

    const {data, isError, error} = useQuery({
        queryKey: ["get-game", gameId],
        queryFn: () => gameClient.getGame(gameId),
        enabled: !!gameId,
        retry: false
    })

    if (isError) {
        const notification = translateApiErrorToNotification(getApiError(error))
        navigateTo("/dashboard", {
            state: {
                ...notification
            }
        })
        return <></>
    }

    return <PageContainer>
        <PageHeader title={data ? "Update Game" : "Add new game"}/>
        <Stack sx={{marginTop: 3}}>
            <GameForm game={data}/>
        </Stack>
    </PageContainer>

}