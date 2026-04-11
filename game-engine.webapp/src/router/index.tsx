import {createBrowserRouter, Navigate} from "react-router-dom";
import {LoginPage} from "../pages/login/page.tsx";
import {DashboardPage} from "../pages/dashboard/page.tsx";
import {AuthRoutes} from "./AuthRoutes.tsx";
import {LogoutPage} from "../pages/logout/page.tsx";
import {PublicRoutes} from "./PublicRoutes.tsx";
import {AppLayout} from "../components/layout/AppLayout.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to={"/login"}/>
    },
    {
        element: <PublicRoutes/>,
        children: [
            {
                path: "/login",
                element: <LoginPage/>
            }
        ]
    },
    {
        path: "/logout",
        element: <LogoutPage/>
    },
    {
        element: <AuthRoutes/>,
        children: [
            {
                element: <AppLayout/>,
                children: [
                    {
                        path: "/dashboard",
                        element: <DashboardPage/>
                    }
                ]
            }
        ]
    }
])