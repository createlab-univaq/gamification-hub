import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {gameClient} from "../../api";
import {GameForm} from "../../components/form/GameForm.tsx";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {type NavigateState, navigateTo} from "../../utils/navigation-utils.ts";
import {Stack} from "@mui/material";
import {useTranslation} from "react-i18next";

export function GameUpsertPage() {

    const {gameId} = useParams()
    const [t] = useTranslation();

    const {data, isError, error} = useQuery({
        queryKey: ["get-game", gameId],
        queryFn: () => gameClient.getGame(gameId!),
        enabled: !!gameId,
        retry: false
    })

    if (isError) {
        const notification = translateApiErrorToNotification(getApiError(error))
        navigateTo("/dashboard", {
            state: {
                ...(notification as unknown as NavigateState)
            }
        })
        return <></>
    }

    return <PageContainer>
        <PageHeader title={t("game.upsert.title")}/>
        <Stack sx={{marginTop: 3}}>
            <GameForm game={data}/>
        </Stack>
    </PageContainer>

}