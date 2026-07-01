import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {teamClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {TeamForm} from "../../components/form/TeamForm.tsx";

export function TeamUpsertPage() {

    const game = useGame()
    const {teamId} = useParams()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-team", game.id, teamId],
        queryFn: () => teamClient.getTeam(game.id, teamId),
        enabled: !!game && !!teamId
    })

    if (teamId && isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/teams`} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <PageHeader title={teamId ? "Aggiorna squadra" : "Aggiungi squadra"}/>
        <Stack sx={{marginTop: 3}}>
            <TeamForm gameId={game.id} team={data}/>
        </Stack>
    </PageContainer>

}
