import type {RouterNavigateOptions} from "react-router-dom";
import type {NotificationType} from "../components/notification/Notification.tsx";
import {router} from "../router";


interface NavigateState {
    type: NotificationType,
    title: string
    content?: string
    data?: Record<string, any>
}

interface NavigateOption extends Omit<RouterNavigateOptions, "state"> {
    state?: NavigateState
}


export function navigateTo(url: string | URL, option?: NavigateOption) {
    router.navigate(url, option)
}

export function getBaseGamePath() {
    const pathParams = location.pathname.split("/")
    if (pathParams.length > 2 && pathParams[1].includes("games")) {
        return `/games/${pathParams[2]}`
    }
    return ""
}