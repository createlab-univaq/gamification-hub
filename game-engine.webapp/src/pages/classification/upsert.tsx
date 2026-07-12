import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {classificationClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {ClassificationForm} from "../../components/form/ClassificationForm.tsx";
import {useTranslation} from "react-i18next";
import {Games, Leaderboard} from "@mui/icons-material";

export function ClassificationUpsertPage() {

    const [t] = useTranslation()
    const game = useGame()
    const {classificationId} = useParams()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-classification", game.id, classificationId],
        queryFn: () => classificationClient.getClassification(game.id!, classificationId!),
        enabled: !!game && !!classificationId
    })

    if (classificationId && isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/classifications`} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <PageHeader
            title={classificationId ? t("leaderboards.upsert.edit") : t("leaderboards.upsert.new")}
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
                    label: t("sidebar.classifications"),
                    href: `/games/${game.id}/classifications`,
                    icon: <Leaderboard/>
                }
            ]}
        />
        <Stack sx={{marginTop: 3}}>
            <ClassificationForm gameId={game.id!} classification={data}/>
        </Stack>
    </PageContainer>

}
