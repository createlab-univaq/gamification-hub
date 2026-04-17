import {GameContextProvider} from "../components/GameContext.tsx";
import {Outlet} from "react-router-dom";

export function GameRoutes() {
    return <GameContextProvider>
        <Outlet/>
    </GameContextProvider>
}