import {useGame} from "../../components/GameContext.tsx";
import {useParams} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {ActionForm} from "../../components/form/ActionForm.tsx";

export function ActionUpsertPage() {

    const game = useGame()
    const {actionName} = useParams()

    return <PageContainer>
        <PageHeader title={actionName ? "Aggiorna azione" : "Aggiungi azione"}/>
        <Stack sx={{marginTop:3}}>
            <ActionForm gameId={game.id} action={actionName}/>
        </Stack>
    </PageContainer>

}