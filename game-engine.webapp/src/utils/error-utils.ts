import type {NotificationMessage} from "../components/notification/NotificationProvider.tsx";

interface ApiError {
    title: string
    message: string
    details?: Record<string, string>
    timestamp?: string
}

export function getApiError(error: object): ApiError {
    if ("title" in error) {
        return error as ApiError
    }
    return {
        title: "Errore generico!",
        message: JSON.stringify(error)
    } satisfies ApiError
}

export function translateApiErrorToNotification(error:ApiError) {
    return {
        title:error.title,
        content:error.message,
        type:"error"
    } satisfies NotificationMessage
}