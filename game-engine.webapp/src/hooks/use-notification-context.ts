import type {NotificationContextState} from "../components/notification/NotificationProvider.tsx";
import {createContext, useContext} from "react";

const defaultState = {
    notification: undefined,
    isSnack: true,
    setNotification: () => {
    }
} satisfies NotificationContextState

export const NotificationContext = createContext<NotificationContextState>(defaultState)

export const useNotificationContext = () => useContext(NotificationContext)