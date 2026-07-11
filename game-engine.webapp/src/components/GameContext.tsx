import {type PropsWithChildren, useState} from "react";
import type {GameDto} from "../api/types";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {gameClient} from "../api";
import {getObjectFromLocalStorage} from "../utils/storage-utils.ts";
import {Loading} from "./Loading.tsx";
import {GameContext} from "../hooks/use-game.ts";


const GAME_KEY = "gamification-engine.ui.game"

export function GameContextProvider({children}: PropsWithChildren) {
    const {gameId} = useParams()
    const queryKey = `get-game-${gameId}`
    const [cachedGame, setCachedGame] = useState(getObjectFromLocalStorage<GameDto>(GAME_KEY))
    const isEnabled = cachedGame ? cachedGame.id != gameId : !!gameId

    function updateCachedGame(game: GameDto) {
        setCachedGame(game)
        localStorage.setItem(GAME_KEY, JSON.stringify(game))
    }

    const {isError, isLoading, data} = useQuery({
        queryKey: [queryKey],
        queryFn: () => gameClient.getGame(gameId!),
        enabled: isEnabled,
        staleTime: Infinity,
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (isError) {
        return <Navigate to={"/dashboard"} state={{
            title: "Game not found!",
            content: "Could not access requested game.",
            type: "error"
        }} replace={true}/>
    }

    if (data && isEnabled) {
        updateCachedGame(data)
    }

    return <GameContext value={cachedGame}>
        {children}
    </GameContext>

}