import {useParams} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {ImpactAnalysisGraph} from "../../components/impact-analysis/ImpactAnalysisGraph.tsx";
import {useQuery} from "@tanstack/react-query";
import {gameClient} from "../../api";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useEffect} from "react";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Typography} from "@mui/material";

export function ImpactAnalysisPage(){

    const {gameId} = useParams()

    const {isLoading, data, error} = useQuery({
        queryKey: ["impact-analysis", gameId],
        queryFn: () => gameClient.staticAnalysis(gameId),
        enabled: !!gameId
    })
    const {setNotification} = useNotificationContext()

    useEffect(() => {
        if(error) {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({
                notification: translateApiErrorToNotification(apiError),
                isSnack: true
            })
            setOpen(false)
        }
    }, [error]);

    if(isLoading) {
        return <Loading fullScreen={true}/>
    }

    return <PageContainer>
        <PageHeader title={"Analisi delle regole"} subTitle={<Typography>ATTENZIONE! Questa feature è attualmente in fase di sperimentazione.</Typography>}/>
        <ImpactAnalysisGraph impactAnalysis={data}/>
    </PageContainer>

}