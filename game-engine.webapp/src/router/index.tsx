import {createBrowserRouter, Navigate} from "react-router-dom";
import {lazy, Suspense} from "react";
import {Loading} from "../components/Loading.tsx";
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
import {ScenarioListPage} from "../pages/scenarios/list.tsx";
import {ChallengeListPage} from "../pages/challenges/list.tsx";
import {ChallengeUpsertPage} from "../pages/challenges/upsert.tsx";
import {TeamListPage} from "../pages/teams/list.tsx";
import {TeamUpsertPage} from "../pages/teams/upsert.tsx";
import {ClassificationListPage} from "../pages/classification/list.tsx";
import {ClassificationUpsertPage} from "../pages/classification/upsert.tsx";
import {ClassificationBoardPage} from "../pages/classification/board.tsx";
import {BadgeListPage} from "../pages/badges/list.tsx";
import {BadgeUpsertPage} from "../pages/badges/upsert.tsx";
import {BadgeDetailsPage} from "../pages/badges/details.tsx";
import {ImpactAnalysisPage} from "../pages/rules/impact-analysis.tsx";
import {LevelListPage} from "../pages/levels/list.tsx";
import {UpsertLevelPage} from "../pages/levels/upsert.tsx";
import {ActionListPage} from "../pages/actions/list.tsx";
import {ActionUpsertPage} from "../pages/actions/upsert.tsx";
import {PointConceptListPage} from "../pages/point-concept/list.tsx";
import {PointConceptUpsertPage} from "../pages/point-concept/upsert.tsx";
import {PointConceptDetailsPage} from "../pages/point-concept/details.tsx";
import {PlayerListPage} from "../pages/players/list.tsx";
import {PlayerUpsertPage} from "../pages/players/upsert.tsx";
import {PlayerDetailsPage} from "../pages/players/details.tsx";
import {UserSettingsPage} from "../pages/settings/page.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const BlocklyRuleUpsertPage = lazy(() => import("../pages/rules/upsert.tsx").then(m => ({default: m.BlocklyRuleUpsertPage})));
// eslint-disable-next-line react-refresh/only-export-components
const SimulationPage = lazy(() => import("../pages/scenarios/page.tsx").then(m => ({default: m.SimulationPage})));

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
                        path: "/settings",
                        element: <UserSettingsPage/>,
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
                                path: "rules/upsert",
                                element: <Suspense
                                    fallback={<Loading fullScreen={true}/>}><BlocklyRuleUpsertPage/></Suspense>
                            },
                            {
                                path: "rules/upsert/:ruleId",
                                element: <Suspense
                                    fallback={<Loading fullScreen={true}/>}><BlocklyRuleUpsertPage/></Suspense>
                            },
                            // SIMULATIONS AND STATIC ANALYSIS
                            {
                                path: "simulate",
                                element: <Suspense fallback={<Loading fullScreen={true}/>}><SimulationPage/></Suspense>
                            },
                            // SCENARIOS (the simulation page is the scenario upsert)
                            {
                                path: "scenarios",
                                element: <ScenarioListPage/>
                            },
                            {
                                path: "scenarios/upsert",
                                element: <Suspense fallback={<Loading fullScreen={true}/>}><SimulationPage/></Suspense>
                            },
                            {
                                path: "scenarios/upsert/:scenarioId",
                                element: <Suspense fallback={<Loading fullScreen={true}/>}><SimulationPage/></Suspense>
                            },
                            {
                                path: "impact-analysis",
                                element: <ImpactAnalysisPage/>
                            },
                            // BADGES
                            {
                                path: "badges",
                                element: <BadgeListPage/>
                            },
                            {
                                path: "badges/upsert",
                                element: <BadgeUpsertPage/>
                            },
                            {
                                path: "badges/upsert/:badgeId",
                                element: <BadgeUpsertPage/>
                            },
                            {
                                path: "badges/:badgeId",
                                element: <BadgeDetailsPage/>
                            },
                            // TEAMS
                            {
                                path: "teams",
                                element: <TeamListPage/>
                            },
                            {
                                path: "teams/upsert",
                                element: <TeamUpsertPage/>
                            },
                            {
                                path: "teams/upsert/:teamId",
                                element: <TeamUpsertPage/>
                            },
                            // CLASSIFICATIONS / LEADERBOARDS
                            {
                                path: "classifications",
                                element: <ClassificationListPage/>
                            },
                            {
                                path: "classifications/upsert",
                                element: <ClassificationUpsertPage/>
                            },
                            {
                                path: "classifications/upsert/:classificationId",
                                element: <ClassificationUpsertPage/>
                            },
                            {
                                path: "classifications/:classificationId/board",
                                element: <ClassificationBoardPage/>
                            },
                            // CHALLENGE MODELS
                            {
                                path: "challenges",
                                element: <ChallengeListPage/>
                            },
                            {
                                path: "challenges/upsert",
                                element: <ChallengeUpsertPage/>
                            },
                            {
                                path: "challenges/upsert/:challengeId",
                                element: <ChallengeUpsertPage/>
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
                            },
                            // PLAYERS
                            {
                                path: "players",
                                element: <PlayerListPage/>
                            },
                            {
                                path: "players/upsert",
                                element: <PlayerUpsertPage/>
                            },
                            {
                                path: "players/:playerId",
                                element: <PlayerDetailsPage/>
                            },
                        ]
                    }
                ]
            }
        ]
    }
])