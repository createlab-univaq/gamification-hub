import {BaseApiClient, TOKEN_KEY, USER_KEY} from "../base-client.ts";
import type {LoginRequest, User} from "../../types/types.ts";
import Cookies from "js-cookie";

export class AuthClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async login(request: LoginRequest) {
        const response = await this.baseClient.post<{ token: string }>(`/auth`, request)
        const token = response.token
        Cookies.set(TOKEN_KEY, token, {
            path: "/",
            expires: 1,
            sameSite: "strict",
            secure: true,
        })
        const userResponse = await this.baseClient.get<User>(`/auth/user`, true)
        Cookies.set(USER_KEY, JSON.stringify(userResponse), {
            path: "/",
            expires: 1,
            sameSite: "strict",
            secure: true,
        })
        return Promise.resolve()
    }

}