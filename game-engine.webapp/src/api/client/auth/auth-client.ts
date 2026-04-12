import {BaseApiClient, TOKEN_KEY, USER_KEY} from "../base-client.ts";
import Cookies from "js-cookie";
import type {LoginRequestDto, UserDto} from "../../types";

export class AuthClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async login(request: LoginRequestDto) {
        const response = await this.baseClient.post<{ token: string }>(`/auth`, request, false)
        const token = response.token
        Cookies.set(TOKEN_KEY, token, {
            path: "/",
            expires: 1,
            sameSite: "strict",
            secure: true,
        })
        await this.loadAuthUser()
        return Promise.resolve()
    }

    public async loadAuthUser() {
        const userResponse = await this.baseClient.get<UserDto>(`/auth/user`)
        Cookies.set(USER_KEY, JSON.stringify(userResponse), {
            path: "/",
            expires: 1,
            sameSite: "strict",
            secure: true,
        })
        return userResponse
    }

}