import {createBrowserRouter, Navigate} from "react-router-dom";
import {LoginPage} from "../pages/login/page.tsx";
import {AuthRoutes} from "./AuthRoutes.tsx";
import {LogoutPage} from "../pages/logout/page.tsx";
import {PublicRoutes} from "./PublicRoutes.tsx";
import {AppLayout} from "../components/layout/AppLayout.tsx";
import {GamesListPage} from "../pages/dashboard/list.tsx";
import {GameUpsertPage} from "../pages/dashboard/upsert.tsx";
import {RulesPage} from "../pages/rules/page.tsx";
import {GameRoutes} from "./GameRoutes.tsx";
import {Stack} from "@mui/material";
import {GamePage} from "../pages/games/page.tsx";

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
                        element: <GamesListPage/>,
                        index: true
                    },
                    {
                        path: "/upsert-game",
                        element: <GameUpsertPage/>
                    },
                    {
                        path: "/upsert-game/:gameId",
                        element: <GameUpsertPage/>
                    },
                    {
                        path: "/games/:gameId",
                        element: <GameRoutes/>,
                        children: [
                            {
                                path: "",
                                element: <GamePage/>
                            },
                            {
                                path: "rules",
                                element: <RulesPage/>
                            }
                        ]
                    }
                ]
            }
        ]
    }
])