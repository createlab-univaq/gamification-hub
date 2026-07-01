import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {challengeClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {ChallengeForm} from "../../components/form/ChallengeForm.tsx";

export function ChallengeUpsertPage() {

    const game = useGame()
    const {challengeId} = useParams()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-challenges", game.id],
        queryFn: () => challengeClient.getChallenges(game.id),
        enabled: !!game && !!challengeId
    })

    if (challengeId && isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/challenges`} replace={true} state={errorMessage}/>
    }

    const challenge = challengeId ? data?.find(c => c.id === challengeId) : undefined

    return <PageContainer>
        <PageHeader title={challengeId ? "Aggiorna modello di sfida" : "Aggiungi modello di sfida"}/>
        <Stack sx={{marginTop: 3}}>
            <ChallengeForm gameId={game.id} challenge={challenge}/>
        </Stack>
    </PageContainer>

}
