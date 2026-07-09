import Cookies from "js-cookie";
import {USER_KEY} from "./storage-utils.ts";
import {authClient} from "../api";
import type {UserDto} from "../api/types";

export function isAuthenticated() {
    return !!Cookies.get(USER_KEY)
}

export function getCurrentUser() : UserDto | undefined {
    const user = Cookies.get(USER_KEY)
    if(user){
        return JSON.parse(user) as UserDto
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