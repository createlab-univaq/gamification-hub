import Cookies from "js-cookie";
import {TOKEN_KEY, USER_KEY} from "../api/client/base-client.ts";
import type {User} from "../api/types/types.ts";

export function isAuthenticated() {
    return !!Cookies.get(TOKEN_KEY)
}

export function getCurrentUser() {
    const user = Cookies.get(USER_KEY)
    if(user){
        return JSON.parse(user) as User
    }
    return undefined
}

export function logout(){
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(USER_KEY)
}