import {useGame} from "../../components/GameContext.tsx";
import {useParams} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {ActionForm} from "../../components/form/ActionForm.tsx";
import {useTranslation} from "react-i18next";

export function ActionUpsertPage() {

    const game = useGame()
    const {actionName} = useParams()
    const [t] = useTranslation()

    return <PageContainer>
        <PageHeader title={actionName ? t("actions.update_title") : t("actions.upsert_title")}/>
        <Stack sx={{marginTop:3}}>
            <ActionForm gameId={game.id} action={actionName}/>
        </Stack>
    </PageContainer>

}