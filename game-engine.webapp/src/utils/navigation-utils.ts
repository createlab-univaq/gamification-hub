import {router} from "../router";
import type {RouterNavigateOptions} from "react-router-dom";
import type {NotificationType} from "../components/notification/Notification.tsx";


interface NavigateState {
    type:NotificationType,
    title:string
    content?:string
    data?:Record<string, any>
}

interface NavigateOption extends Omit<RouterNavigateOptions, "state"> {
    state?:NavigateState
}


export function navigateTo(url:string | URL, option:NavigateOption) {
    router.navigate(url, option)
}