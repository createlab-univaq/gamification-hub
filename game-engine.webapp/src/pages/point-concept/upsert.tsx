import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {PointConceptForm} from "../../components/form/PointConceptForm.tsx";
import {useQuery} from "@tanstack/react-query";
import {pointConceptClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useTranslation} from "react-i18next";
import {Games, Stars} from "@mui/icons-material";

export function PointConceptUpsertPage() {

    const game = useGame()
    const {pcId} = useParams()
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-pc", pcId],
        queryFn: () => pointConceptClient.getPointConcept(game.id!, pcId!),
        enabled: !!game && !!pcId
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <PageHeader
            title={t("points.form.title")}
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
                    icon: <Stars/>,
                    label: t("sidebar.points"),
                    href: `/games/${game.id}`
                }
            ]}
        />
        <Stack sx={{marginTop: 3}}>
            <PointConceptForm gameId={game.id!} pointConcept={data}/>
        </Stack>
    </PageContainer>

}