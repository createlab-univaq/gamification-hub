import {createBrowserRouter, Navigate} from "react-router-dom";
import {LoginPage} from "../pages/login/page.tsx";
import {AuthRoutes} from "./AuthRoutes.tsx";
import {LogoutPage} from "../pages/logout/page.tsx";
import {PublicRoutes} from "./PublicRoutes.tsx";
import {AppLayout} from "../components/layout/AppLayout.tsx";
import {GamesListPage} from "../pages/dashboard/list.tsx";
import {GameUpsertPage} from "../pages/dashboard/upsert.tsx";
import {GameRoutes} from "./GameRoutes.tsx";
import {GamePage} from "../pages/games/page.tsx";
import {ErrorPage} from "../pages/error/page.tsx";
import {RuleListPage} from "../pages/rules/list.tsx";
import {RuleUpsertPage} from "../pages/rules/upsert.tsx";
import {TestPage} from "../pages/TestPage.tsx";
import {BlocklyRuleUpsertPage} from "../pages/rules/upsert-blockly.tsx";
import {SimulationPage} from "../pages/simulation/page.tsx";
import {ImpactAnalysisPage} from "../pages/rules/impact-analysis.tsx";
import {LevelListPage} from "../pages/levels/list.tsx";
import {UpsertLevelPage} from "../pages/levels/upsert.tsx";
import {ActionListPage} from "../pages/actions/list.tsx";
import {ActionUpsertPage} from "../pages/actions/upsert.tsx";
import {PointConceptListPage} from "../pages/point-concept/list.tsx";
import {PointConceptUpsertPage} from "../pages/point-concept/upsert.tsx";
import {PointConceptDetailsPage} from "../pages/point-concept/details.tsx";

export const router = createBrowserRouter([
    {
        path: "*",
        element: <ErrorPage/>
    },
    {
        path: "/",
        element: <Navigate to={"/login"}/>,
    },
    {
        path: "/testing",
        element: <TestPage/>,
        errorElement: <ErrorPage/>
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
        errorElement: <ErrorPage/>,
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
                            // RULE PAGES
                            {
                                path: "rules",
                                element: <RuleListPage/>
                            },
                            {
                                path: "upsert-rule-old/",
                                element: <RuleUpsertPage/>
                            },
                            {
                                path: "upsert-rule-old/:ruleId",
                                element: <RuleUpsertPage/>
                            },
                            {
                                path: "upsert-rule",
                                element: <BlocklyRuleUpsertPage/>
                            },
                            {
                                path: "upsert-rule/:ruleId",
                                element: <BlocklyRuleUpsertPage/>
                            },
                            // SIMULATIONS AND STATIC ANALYSIS
                            {
                                path: "simulate",
                                element: <SimulationPage/>
                            },
                            {
                                path: "impact-analysis",
                                element: <ImpactAnalysisPage/>
                            },
                            // LEVEL PAGES
                            {
                                path: "levels",
                                element: <LevelListPage/>
                            },
                            {
                                path: "levels/upsert/:levelName",
                                element: <UpsertLevelPage/>
                            },
                            {
                                path: "levels/upsert",
                                element: <UpsertLevelPage/>
                            },
                            // ACTION PAGES
                            {
                                path: "actions",
                                element: <ActionListPage/>
                            },
                            {
                                path: "actions/upsert/:actionName",
                                element: <ActionUpsertPage/>
                            },
                            {
                                path: "actions/upsert",
                                element: <ActionUpsertPage/>
                            },
                            // POINT CONCEPTS
                            {
                                path: "points",
                                element: <PointConceptListPage/>
                            },
                            {
                                path: "points/:pcId",
                                element: <PointConceptDetailsPage/>
                            },
                            {
                                path: "points/upsert",
                                element: <PointConceptUpsertPage/>
                            },
                            {
                                path: "points/upsert/:pcId",
                                element: <PointConceptUpsertPage/>
                            }
                        ]
                    }
                ]
            }
        ]
    }
])