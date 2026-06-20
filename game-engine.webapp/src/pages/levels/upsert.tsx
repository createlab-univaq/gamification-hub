import {useGame} from "../../components/GameContext.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {levelClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {LevelForm} from "../../components/form/LevelForm.tsx";
import {Stack} from "@mui/material";

export function UpsertLevelPage() {
    const game = useGame()
    const {levelName} = useParams()

    const {isLoading, data, error, isError} = useQuery({
        queryKey: ["get-level", levelName],
        queryFn: () => levelClient.getLevel(game.id, levelName),
        enabled: !!game && !!levelName
    })

    if (isError) {
        const notification = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={`/games/${game.id}/levels`} replace={true} state={notification}/>
    }

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    return <PageContainer>
        <PageHeader title={levelName ? "Aggiorna Livello" : "Aggiungi Livello"}/>
        <Stack sx={{marginTop:3}}>
            <LevelForm gameId={game.id} level={data}/>
        </Stack>
    </PageContainer>
}