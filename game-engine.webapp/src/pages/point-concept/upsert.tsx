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

export function PointConceptUpsertPage() {

    const game = useGame()
    const {pcId} = useParams()

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
        <PageHeader title={pcId ? "Modifica punteggio" : "Aggiungi punteggio"}/>
        <Stack sx={{marginTop: 3}}>
            <PointConceptForm gameId={game.id!} pointConcept={data}/>
        </Stack>
    </PageContainer>

}