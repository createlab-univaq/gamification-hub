import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {badgeClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {BadgeForm} from "../../components/form/BadgeForm.tsx";
import {Games, MilitaryTech} from "@mui/icons-material";
import {useTranslation} from "react-i18next";

export function BadgeUpsertPage() {

    const game = useGame()
    const {badgeId} = useParams()
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-badge", game.id, badgeId],
        queryFn: () => badgeClient.getBadge(game.id!, badgeId!),
        enabled: !!game && !!badgeId
    })

    if (badgeId && isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/badges`} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <PageHeader
            title={t("badges.form.title")}
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
                    label: t("sidebar.badges"),
                    href: `/games/${game.id}/badges`,
                    icon: <MilitaryTech/>
                }
            ]}
        />
        <Stack sx={{marginTop: 3}}>
            <BadgeForm gameId={game.id!} badge={data}/>
        </Stack>
    </PageContainer>

}
