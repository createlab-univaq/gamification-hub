import {AuthClient} from "./client/auth/auth-client.ts";
import {BaseApiClient} from "./client/base-client.ts";
import {appConfig} from "../config";
import {QueryClient} from "@tanstack/react-query";
import {GameClient} from "./client/games/game-client.ts";
import {RuleClient} from "./client/games/rule-client.ts";
import {SimulationClient} from "./client/games/simulation-client.ts";

const apiBaseClient = new BaseApiClient({
    baseUrl: appConfig.baseApiUrl
})
export const queryClient = new QueryClient()
export const authClient = new AuthClient(apiBaseClient)
export const gameClient = new GameClient(apiBaseClient)
export const ruleClient = new RuleClient(apiBaseClient)
export const simulationClient = new SimulationClient(apiBaseClient)