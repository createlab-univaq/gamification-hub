import {isAuthenticated} from "../utils/auth-utils.ts";
import {Navigate, Outlet} from "react-router-dom";

export function PublicRoutes() {
    if (isAuthenticated()) {
        return <Navigate to={"/dashboard"} replace={true}/>
    }
    return <Outlet/>
}