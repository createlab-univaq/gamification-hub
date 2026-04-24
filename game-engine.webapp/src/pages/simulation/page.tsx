import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {useQuery} from "@tanstack/react-query";
import {ruleClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";

export function SimulationPage() {

    const game = useGame()
    const {ruleId} = useParams()

    const {isLoading, error, data} = useQuery({
        queryKey: ["get-simulation-rule", ruleId],
        queryFn: ()=>ruleClient.getRule(game.id, ruleId),
        enabled: !!ruleId
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/rules`}
                         replace={true}
                         state={errorMessage}
        />
    }

    console.log(data)

    return <PageContainer>
        <PageHeader title={"Simulation"}/>
    </PageContainer>

}