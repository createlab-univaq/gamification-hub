import Cookies from "js-cookie";


interface BaseApiClientProps {
    baseUrl: string
}

export const TOKEN_KEY = 'gamification-api-token'
export const USER_KEY = 'gamification-api-user'


export class BaseApiClient {

    private baseUrl: string

    constructor({baseUrl}: BaseApiClientProps) {
        this.baseUrl = baseUrl
    }

    private getHeaders(authenticated?: boolean) {
        const headers = new Headers()
        if (authenticated) {
            const token = Cookies.get(TOKEN_KEY)
            console.log(token)
            headers.set("Authorization", `Bearer ${token}`)
        }
        headers.set("Content-Type", "application/json")
        return headers
    }

    private async sendRequest(url: RequestInfo | URL, options?: RequestInit) {
        const result = await fetch(url, options)
        try {
            const message = await result.json()
            if(!result.ok) {
                return Promise.reject(message)
            }
            return Promise.resolve(message)
        } catch (error) {
            // message is not a JSON
            const message = await result.text()
            return Promise.reject(message ?? `An error has occured: ${error}`)

        }
    }

    public async get<T>(resource: string, authenticated?: boolean): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {headers})
    }

    public async post<T>(resource: string, body: object, authenticated?: boolean): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "POST",
            body: JSON.stringify(body)
        })
    }

    public async put<T>(resource: string, body: object, authenticated?: boolean): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "PUT",
            body: JSON.stringify(body)
        })
    }

    public async patch<T>(resource: string, body: object, authenticated?: boolean): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "PATCH",
            body: JSON.stringify(body)
        })
    }

    public async delete<T>(resource: string, authenticated?: boolean): Promise<T> {
        const headers = this.getHeaders(authenticated)
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers,
            method: "DELETE"
        })
    }


}