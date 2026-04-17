export function getObjectFromLocalStorage<T>(key:string) {
    const item = localStorage.getItem(key)
    try {
        return item ? JSON.parse(item) as T : undefined
    } catch (error) {
        return undefined
    }
}