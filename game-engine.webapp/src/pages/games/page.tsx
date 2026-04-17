import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../components/GameContext.tsx";

export function GamePage() {

    const game = useGame()

    return <PageContainer>
        <PageHeader title={game?.name}/>
    </PageContainer>

}