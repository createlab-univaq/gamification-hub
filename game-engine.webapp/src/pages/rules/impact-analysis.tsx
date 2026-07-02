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
import {Stack, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

export function ImpactAnalysisPage(){

    const {gameId} = useParams()
    const [t] = useTranslation()

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
        <PageHeader title={t("impact_analysis.title")} subTitle={<Typography>{t("impact_analysis.subtitle_warning")}</Typography>}/>
        <Stack sx={{my:3}}>
            <ImpactAnalysisGraph impactAnalysis={data}/>
        </Stack>
    </PageContainer>

}