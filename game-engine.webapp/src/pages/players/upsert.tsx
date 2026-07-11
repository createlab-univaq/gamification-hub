import {useGame} from "../../hooks/use-game";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {PlayerForm} from "../../components/form/PlayerForm.tsx";
import {useTranslation} from "react-i18next";

export function PlayerUpsertPage() {

    const game = useGame()
    const [t] = useTranslation()

    return <PageContainer>
        <PageHeader title={t("players.upsert_title")}/>
        <Stack sx={{marginTop: 3}}>
            <PlayerForm gameId={game.id!}/>
        </Stack>
    </PageContainer>

}
