import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {scenarioClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {SimulationForm} from "../../components/form/SimulationForm.tsx";

export function SimulationPage() {

    const game = useGame()
    const {scenarioId} = useParams()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-scenario", game.id, scenarioId],
        queryFn: () => scenarioClient.getScenario(game.id!, scenarioId!),
        enabled: !!game && !!scenarioId
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <SimulationForm gameId={game.id!} scenario={data}/>
    </PageContainer>

}
