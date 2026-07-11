import {type PropsWithChildren, type ReactNode, useCallback, useMemo, useState} from "react";
import type {NotificationType} from "./Notification.tsx";
import {FullScreenNotification, PopupNotification} from "./Notification.tsx";
import {NotificationContext} from "../../hooks/use-notification-context.ts";


export interface NotificationMessage {
    title: ReactNode
    content: ReactNode
    type: NotificationType
    details?: Record<string, string>
}

export interface NotificationContextState {
    notification: NotificationMessage | undefined
    isSnack: boolean
    setNotification: (value: Omit<NotificationContextState, "setNotification">) => void
}


export function NotificationProvider({children}: PropsWithChildren) {
    const [notification, setNotification] = useState<NotificationMessage>()
    const [isSnack, setSnack] = useState(false)
    const [isOpen, setOpen] = useState(false)

    const updateNotifications = (value: Omit<NotificationContextState, "setNotification">) => {
        setNotification(value.notification)
        setSnack(value.isSnack)
        setOpen(!!value.notification)
    }

    const handleClose = useCallback((value: boolean) => {
        if (!value) {
            updateNotifications({
                notification: undefined,
                isSnack: isSnack
            })
            return
        }
        setOpen(value)
    }, [isSnack])


    const NotificationArea = useMemo(() => {
        if (!notification) {
            return <></>;
        }
        if (isSnack) {
            return <PopupNotification title={notification.title} message={notification.content} type={notification.type}
                                      isOpen={isOpen} setOpen={handleClose}/>
        }
        return <FullScreenNotification title={notification.title} message={notification.content}
                                       type={notification.type} isOpen={isOpen} setOpen={handleClose}/>
    }, [notification, isSnack, isOpen, handleClose])

    return <NotificationContext value={{
        setNotification: updateNotifications,
        notification: notification,
        isSnack: isSnack
    }}>
        {NotificationArea}
        {children}
    </NotificationContext>
}