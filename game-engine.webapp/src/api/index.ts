import {AuthClient} from "./client/auth/auth-client.ts";
import {BaseApiClient} from "./client/base-client.ts";
import {appConfig} from "../config";
import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";
import {HttpError} from "./http-error.ts";
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
import {ClassificationClient} from "./client/games/classification-client.ts";
import {PlayerChallengeClient} from "./client/games/player-challenge-client.ts";
import {PlayerInventoryClient} from "./client/games/player-inventory-client.ts";
import {GroupChallengeClient} from "./client/games/group-challenge-client.ts";

const apiBaseClient = new BaseApiClient({
    baseUrl: appConfig.baseApiUrl
})
let unauthorizedHandler: (() => void) | undefined

export function setUnauthorizedHandler(handler: () => void) {
    unauthorizedHandler = handler
}

function handleUnauthorized(error: unknown) {
    if (error instanceof HttpError && error.status === 401) {
        unauthorizedHandler?.()
    }
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({onError: handleUnauthorized}),
    mutationCache: new MutationCache({onError: handleUnauthorized}),
    defaultOptions: {
        queries: {
            retry: (failureCount, error) =>
                !(error instanceof HttpError && error.status === 401) && failureCount < 3,
        },
    },
})
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
export const classificationClient = new ClassificationClient(apiBaseClient)
export const playerChallengeClient = new PlayerChallengeClient(apiBaseClient)
export const playerInventoryClient = new PlayerInventoryClient(apiBaseClient)
export const groupChallengeClient = new GroupChallengeClient(apiBaseClient)