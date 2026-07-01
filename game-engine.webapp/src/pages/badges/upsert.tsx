import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {badgeClient} from "../../api";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {BadgeForm} from "../../components/form/BadgeForm.tsx";

export function BadgeUpsertPage() {

    const game = useGame()
    const {badgeId} = useParams()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-badge", game.id, badgeId],
        queryFn: () => badgeClient.getBadge(game.id, badgeId),
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
        <PageHeader title={badgeId ? "Aggiorna collezione" : "Aggiungi collezione"}/>
        <Stack sx={{marginTop: 3}}>
            <BadgeForm gameId={game.id} badge={data}/>
        </Stack>
    </PageContainer>

}
