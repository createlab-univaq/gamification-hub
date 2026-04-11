import {AuthClient} from "./client/auth/auth-client.ts";
import {BaseApiClient} from "./client/base-client.ts";
import {appConfig} from "../config";
import {QueryClient} from "@tanstack/react-query";

const apiBaseClient = new BaseApiClient({
    baseUrl: appConfig.baseApiUrl
})
export const queryClient = new QueryClient()
export const authClient = new AuthClient(apiBaseClient)