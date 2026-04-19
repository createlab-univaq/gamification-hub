import Cookies from "js-cookie";
import {TOKEN_KEY} from "../../utils/storage-utils.ts";


interface BaseApiClientProps {
    baseUrl: string
}

export class BaseApiClient {

    private baseUrl: string

    constructor({baseUrl}: BaseApiClientProps) {
        this.baseUrl = baseUrl
    }

    private getHeaders(authenticated = true) {
        const headers = new Headers()
        if (authenticated) {
            const token = Cookies.get(TOKEN_KEY)
            headers.set("Authorization", `Bearer ${token}`)
        }
        headers.set("Content-Type", "application/json")
        return headers
    }

    private async sendRequest(url: RequestInfo | URL, options?: RequestInit) {
        const result = await fetch(url, options)
        try {
            if (result.status === 204) {
                return Promise.resolve()
            }
            const message = await result.json()
            if (!result.ok) {
                return Promise.reject(message)
            }
            return Promise.resolve(message)
        } catch (error) {
            // message is not a JSON
            const message = await result.text()
            return Promise.reject(message ?? `An error has occured: ${error}`)
        }
    }

    public async get<T>(resource: string, authenticated = true): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {headers})
    }

    public async post<T>(resource: string, body: object, authenticated = true): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "POST",
            body: JSON.stringify(body)
        })
    }

    public async put<T>(resource: string, body: object, authenticated = true): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "PUT",
            body: JSON.stringify(body)
        })
    }

    public async patch<T>(resource: string, body: object, authenticated = true): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "PATCH",
            body: JSON.stringify(body)
        })
    }

    public async delete<T>(resource: string, authenticated = true): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "DELETE"
        })
    }


}