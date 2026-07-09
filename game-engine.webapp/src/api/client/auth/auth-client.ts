import Cookies from "js-cookie";
import type {LoginRequestDto, UserDto} from "../../types";
import type {BaseApiClient} from "../base-client.ts";
import {USER_KEY} from "../../../utils/storage-utils.ts";

const USER_COOKIE_OPTIONS = {
    path: "/",
    expires: 1,
    sameSite: "strict",
    secure: true,
} as const

export class AuthClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async login(request: LoginRequestDto) {
        const user = await this.baseClient.post<UserDto>(`/auth`, request)
        Cookies.set(USER_KEY, JSON.stringify(user), USER_COOKIE_OPTIONS)
        return user
    }


    public async logout() {
        await this.baseClient.post(`/auth/logout`, {})
        Cookies.remove(USER_KEY, {path: "/"})
    }

    public async register(request: LoginRequestDto) {
        return this.baseClient.post<UserDto>(`/auth/register`, request)
    }

    public async deactivateUser() {
        return this.baseClient.delete(`/auth/deactivate`)
    }

    public async updateUser(request: LoginRequestDto) {
        const user = await this.baseClient.put<UserDto>(`/auth/update-user`, request)
        Cookies.set(USER_KEY, JSON.stringify(user), USER_COOKIE_OPTIONS)
        return user
    }

}
