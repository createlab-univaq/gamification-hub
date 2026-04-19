import Cookies from "js-cookie";
import type {User} from "../api/types/types.ts";
import {TOKEN_KEY, USER_KEY} from "./storage-utils.ts";

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
    Cookies.remove(TOKEN_KEY, {
        path:"/"
    })
    Cookies.remove(USER_KEY, {
        path:"/"
    })
}