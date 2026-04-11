import {createContext, PropsWithChildren, useContext, useMemo, useState} from "react";
import type {NotificationType} from "./Notification.tsx";
import {FullScreenNotification, PopupNotification} from "./Notification.tsx";


export interface NotificationMessage {
    title: string
    content: string
    type: NotificationType
}

interface NotificationContextState {
    notification: NotificationMessage | undefined
    isSnack: boolean
    setNotification: (value: Omit<NotificationContextState, "setNotification">) => void
}

const defaultState = {
    notification: undefined,
    isSnack: true,
    setNotification: () => {
    }
} satisfies NotificationContextState

const NotificationContext = createContext<NotificationContextState>(defaultState)

export const useNotificationContext = ()=>useContext(NotificationContext)

export function NotificationProvider({children}: PropsWithChildren) {
    const [notification, setNotification] = useState<NotificationMessage>(undefined)
    const [isSnack, setSnack] = useState(false)
    const [isOpen, setOpen] = useState(false)

    const updateNotifications = (value: Omit<NotificationContextState, "setNotification">) => {
        setNotification(value.notification)
        setSnack(value.isSnack)
        setOpen(!!value.notification)
    }

    const handleClose = (value: boolean) => {
        if (!value) {
            updateNotifications({
                notification: undefined,
                isSnack: isSnack
            })
            return
        }
        setOpen(value)
    }


    const NotificationArea = useMemo(() => {
        console.log(notification, isSnack)
        if (!notification) {
            return <></>;
        }
        if (isSnack) {
            return <PopupNotification title={notification.title} message={notification.content} type={notification.type}
                                      isOpen={isOpen} setOpen={handleClose}/>
        }
        return <FullScreenNotification title={notification.title} message={notification.content}
                                       type={notification.type} isOpen={isOpen} setOpen={handleClose}/>
    }, [notification, isSnack, isOpen])

    return <NotificationContext value={{
        setNotification: updateNotifications,
        notification: notification,
        isSnack: isSnack
    }}>
        {NotificationArea}
        {children}
    </NotificationContext>
}