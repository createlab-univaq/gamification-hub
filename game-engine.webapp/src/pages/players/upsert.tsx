import {useGame} from "../../hooks/use-game";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {PlayerForm} from "../../components/form/PlayerForm.tsx";

export function PlayerUpsertPage() {

    const game = useGame()

    return <PageContainer>
        <PageHeader title={"Aggiungi giocatore"}/>
        <Stack sx={{marginTop: 3}}>
            <PlayerForm gameId={game.id!}/>
        </Stack>
    </PageContainer>

}
