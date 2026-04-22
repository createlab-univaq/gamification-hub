import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {ruleClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {BlocklyRuleForm} from "../../components/form/BlocklyRuleForm.tsx";

export function BlocklyRuleUpsertPage() {

    const game = useGame()
    const {ruleId} = useParams()

    const {data, isError, error, isLoading} = useQuery({
        queryKey: ["get-rule", ruleId],
        queryFn: () => ruleClient.getRule(game.id, ruleId),
        enabled: !!ruleId,
        retry: false
    })


    if (isError) {
        const notification = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/rules`} replace={true} state={notification}/>
    }

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    return <BlocklyRuleForm
        title={data ? "Update rule" : "Create rule"}
        subTitle={""}
        gameId={game.id}
        rule={data}
    />

}