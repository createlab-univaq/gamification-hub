import {AuthClient} from "./client/auth/auth-client.ts";
import {BaseApiClient} from "./client/base-client.ts";
import {appConfig} from "../config";
import {QueryClient} from "@tanstack/react-query";
import {GameClient} from "./client/games/game-client.ts";
import {RuleClient} from "./client/games/rule-client.ts";
import {SimulationClient} from "./client/games/simulation-client.ts";
import {LevelClient} from "./client/games/level-client.ts";
import {PointConceptClient} from "./client/games/point-concept-client.ts";
import {ChallengeClient} from "./client/games/challenge-client.ts";
import {ActionClient} from "./client/games/action-client.ts";
import {PlayerClient} from "./client/games/player-client.ts";
import {ScenarioClient} from "./client/games/scenario-client.ts";
import {TeamClient} from "./client/games/team-client.ts";
import {BadgeClient} from "./client/games/badge-client.ts";

const apiBaseClient = new BaseApiClient({
    baseUrl: appConfig.baseApiUrl
})
export const queryClient = new QueryClient()
export const authClient = new AuthClient(apiBaseClient)
export const gameClient = new GameClient(apiBaseClient)
export const ruleClient = new RuleClient(apiBaseClient)
export const simulationClient = new SimulationClient(apiBaseClient)
export const levelClient = new LevelClient(apiBaseClient)
export const pointConceptClient = new PointConceptClient(apiBaseClient)
export const challengeClient = new ChallengeClient(apiBaseClient)
export const actionClient = new ActionClient(apiBaseClient)
export const playerClient = new PlayerClient(apiBaseClient)
export const scenarioClient = new ScenarioClient(apiBaseClient)
export const teamClient = new TeamClient(apiBaseClient)
export const badgeClient = new BadgeClient(apiBaseClient)