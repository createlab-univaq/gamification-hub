import {Navigate, Outlet} from "react-router-dom";
import {useNotificationContext} from "../components/notification/NotificationProvider.tsx";
import {isAuthenticated} from "../utils/auth-utils.ts";

export function AuthRoutes() {

    const {setNotification} = useNotificationContext()

    if (!isAuthenticated()) {
        setNotification({
            notification: {
                type: "error",
                title: "Utente non autorizzato",
                content: "Non sei autorizzato ad accedere a questa pagina."
            },
            isSnack: true
        })
        return <Navigate to={"/login"}/>
    }
    return <Outlet/>
}