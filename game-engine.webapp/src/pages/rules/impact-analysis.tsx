import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {ImpactAnalysisGraph} from "../../components/impact-analysis/ImpactAnalysisGraph.tsx";
import {useQuery} from "@tanstack/react-query";
import {gameClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Stack, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Games, Rule} from "@mui/icons-material";
import {useGame} from "../../hooks/use-game.ts";

export function ImpactAnalysisPage() {

    const [t] = useTranslation()
    const game = useGame()

    const {isLoading, data, error} = useQuery({
        queryKey: ["impact-analysis", game.id],
        queryFn: () => gameClient.staticAnalysis(game.id!),
        enabled: !!game.id
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const notification = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={notification}/>
    }

    return <PageContainer>
        <PageHeader title={t("impact_analysis.title")}
                    subTitle={<Typography color={"warning"}>{t("impact_analysis.subtitle_warning")}</Typography>}
                    breadcrumbs={[
                        {
                            icon: <Games/>,
                            label: t("sidebar.games"),
                            href: "/dashboard"
                        },
                        {
                            label: game.name ?? "My Game",
                            href: `/games/${game.id}`
                        },
                        {
                            label: t("sidebar.rules"),
                            href: `/games/${game.id}`,
                            icon: <Rule/>
                        }
                    ]}
        />
        <Stack sx={{my: 3}}>
            <ImpactAnalysisGraph impactAnalysis={data!}/>
        </Stack>
    </PageContainer>

}