import {type PropsWithChildren, useEffect} from "react";
import type {GameDto} from "../api/types";
import {Navigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {gameClient} from "../api";
import {GAME_STORAGE_KEY, getObjectFromLocalStorage} from "../utils/storage-utils.ts";
import {Loading} from "./Loading.tsx";
import {GameContext} from "../hooks/use-game.ts";

const GAME_STALE_MS = 5 * 60 * 1000

// The moment of the fetch is kept beside the game so that a reload resumes the same
// staleness rather than starting a fresh one, which would refetch on every page load.
type CachedGame = { game?: GameDto, updatedAt?: number }

export const gameQueryKey = (gameId?: string) => ["get-game", gameId]

export function GameContextProvider({children}: PropsWithChildren) {
    const {gameId} = useParams()
    const cached = getObjectFromLocalStorage<CachedGame>(GAME_STORAGE_KEY)
    const seed = cached?.game?.id === gameId ? cached : undefined

    const {isError, isLoading, data} = useQuery({
        queryKey: gameQueryKey(gameId),
        queryFn: () => gameClient.getGame(gameId!),
        enabled: !!gameId,
        initialData: seed?.game,
        initialDataUpdatedAt: seed?.updatedAt,
        staleTime: GAME_STALE_MS,
    })

    useEffect(() => {
        if (data) {
            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({game: data, updatedAt: Date.now()}))
        }
    }, [data])

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

    return <GameContext value={data}>
        {children}
    </GameContext>

}
