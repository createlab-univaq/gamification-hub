import type {NotificationMessage} from "../components/notification/NotificationProvider.tsx";
import {Stack, Typography} from "@mui/material";
import React from "react";

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
        message: JSON.stringify(error),
        details: error.details ?? undefined,
        timestamp: error.timestamp ?? ""
    } satisfies ApiError
}

export function translateApiErrorToNotification(error: ApiError) {
    const message = React.createElement(Typography, {key: "error-message"}, error.message)
    const contentChildren = [message]
    if (error.details) {
        Object.entries(error.details).map(e => {
            contentChildren.push(React.createElement(Typography, {}, `${e[0]}: ${e[1]}`))
        })
    }
    const content = React.createElement(Stack, {sx:{gap:1}}, contentChildren)
    return {
        title: error.title,
        content: content,
        type: "error"
    } satisfies NotificationMessage
}