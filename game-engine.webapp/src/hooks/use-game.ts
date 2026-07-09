import {createContext, useContext} from "react";
import type {GameDto} from "../api/types";

export const GameContext = createContext<GameDto | undefined>(undefined)

export const useGame = () => {
    const ctx = useContext(GameContext)
    if (!ctx) {
        throw new Error("GameContext can only be used inside a GameProvider!")
    }
    return ctx
}