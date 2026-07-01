import Cookies from "js-cookie";
import type {User} from "../api/types/types.ts";
import {USER_KEY} from "./storage-utils.ts";
import {authClient} from "../api";

export function isAuthenticated() {
    return !!Cookies.get(USER_KEY)
}

export function getCurrentUser() {
    const user = Cookies.get(USER_KEY)
    if(user){
        return JSON.parse(user) as User
    }
    return undefined
}

export async function logout(){
    try {
        await authClient.logout()
    } finally {
        Cookies.remove(USER_KEY, {
            path:"/"
        })
    }
}