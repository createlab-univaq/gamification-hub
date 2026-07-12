import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {challengeClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {ChallengeForm} from "../../components/form/ChallengeForm.tsx";
import {Games, SportsScore} from "@mui/icons-material";
import {useTranslation} from "react-i18next";

export function ChallengeUpsertPage() {

    const game = useGame()
    const {challengeId} = useParams()
    const [t] = useTranslation();

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-challenges", game.id],
        queryFn: () => challengeClient.getChallenges(game.id!),
        enabled: !!game && !!challengeId
    })

    if (challengeId && isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/challenges`} replace={true} state={errorMessage}/>
    }

    const challenge = challengeId ? data?.find(c => c.id === challengeId) : undefined

    return <PageContainer>
        <PageHeader
            title={t("challenges.form.title")}
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
                    label: t("sidebar.challenges"),
                    href: `/games/${game.id}/challenges`,
                    icon: <SportsScore/>
                }
            ]}
        />
        <Stack sx={{marginTop: 3}}>
            <ChallengeForm gameId={game.id!} challenge={challenge}/>
        </Stack>
    </PageContainer>

}
