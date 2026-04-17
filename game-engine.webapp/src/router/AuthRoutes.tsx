import {Navigate, Outlet} from "react-router-dom";
import {useNotificationContext} from "../components/notification/NotificationProvider.tsx";
import {isAuthenticated} from "../utils/auth-utils.ts";

export function AuthRoutes() {

    if (!isAuthenticated()) {
        return <Navigate to={"/login"} state={{
            type: "error",
            title: "User not authorized",
            content: "You are not authorized to enter the page."
        }}/>
    }

    return <Outlet/>
}