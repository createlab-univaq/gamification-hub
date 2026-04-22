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
import {ErrorPage} from "../pages/error/page.tsx";
import {RuleListPage} from "../pages/rules/list.tsx";
import {RuleUpsertPage} from "../pages/rules/upsert.tsx";
import {BlocklyRuleForm} from "../components/form/BlocklyRuleForm.tsx";
import {TestPage} from "../pages/TestPage.tsx";
import {BlocklyRuleUpsertPage} from "../pages/rules/upsert-blockly.tsx";

export const router = createBrowserRouter([
    {
      path:"*",
      element: <ErrorPage/>
    },
    {
        path: "/",
        element: <Navigate to={"/login"}/>,
    },
    {
        path: "/testing",
        element: <TestPage/>,
        errorElement:<ErrorPage/>
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
        errorElement:<ErrorPage/>,
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
                                element: <RuleListPage/>
                            },
                            {
                                path: "upsert-rule",
                                element: <RuleUpsertPage/>
                            },
                            {
                                path: "upsert-rule/:ruleId",
                                element: <RuleUpsertPage/>
                            },
                            {
                                path: "blockly",
                                element: <BlocklyRuleUpsertPage/>
                            },
                            {
                                path: "blockly/:ruleId",
                                element: <BlocklyRuleUpsertPage/>
                            }
                        ]
                    }
                ]
            }
        ]
    }
])