import {Navigate, Outlet} from "react-router-dom";
import {isAuthenticated} from "../utils/auth-utils.ts";
import {useTranslation} from "react-i18next";

export function AuthRoutes() {

    const [t] = useTranslation();

    if (!isAuthenticated()) {
        return <Navigate to={"/login"} state={{
            type: "error",
            title: t("errors:user_not_authorized_title"),
            content: t("errors:user_not_authorized")
        }}/>
    }

    return <Outlet/>
}