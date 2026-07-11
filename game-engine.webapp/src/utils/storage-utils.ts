export const GAME_STORAGE_KEY = "gamification-engine.ui.game"
export const USER_KEY = 'gamification-api-user'
export const SIDEBAR_OPEN_KEY = "game-engine.ui.sidebar-open"

export function getObjectFromLocalStorage<T>(key: string) {
    const item = localStorage.getItem(key)
    try {
        return item ? JSON.parse(item) as T : undefined
    } catch (error) {
        console.debug(`Could not find object from local storage: ${key}\n ${error}`)
        return undefined
    }
}