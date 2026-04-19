import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {ruleClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {RuleBuilder} from "../../components/rule-builder/RuleBuilder.tsx";
import {RuleForm} from "../../components/form/RuleForm.tsx";
import {Loading} from "../../components/Loading.tsx";
import {DroolEditor} from "../../components/rule-builder/DroolEditor.tsx";

export function RuleUpsertPage() {

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

    if(isLoading) {
        return <Loading fullScreen={true}/>
    }

    return <PageContainer>
        <PageHeader title={data ? "Update existing rule" : "Create new rule"}
                    subTitle={"Use the integrated rule builder or update the drool's code directly."}
        />
        <Stack sx={{marginTop: 3, minHeight:"80dvh"}}>
            <RuleForm gameId={game.id} rule={data}/>
        </Stack>
    </PageContainer>

}