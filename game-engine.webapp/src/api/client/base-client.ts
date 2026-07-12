import {HttpError} from "../http-error.ts";

interface BaseApiClientProps {
    baseUrl: string
}

export class BaseApiClient {

    protected baseUrl: string

    constructor({baseUrl}: BaseApiClientProps) {
        this.baseUrl = baseUrl
    }

    protected getHeaders() {
        const headers = new Headers()
        headers.set("Content-Type", "application/json")
        return headers
    }

    protected async sendRequest<T>(url: RequestInfo | URL, options?: RequestInit): Promise<T> {
        const result = await fetch(url, {credentials: "include", ...options})
        if (result.status === 204) {
            return undefined as T
        }
        const raw = await result.text()
        let body: unknown
        try {
            body = raw ? JSON.parse(raw) : null
        } catch {
            body = raw
        }
        if (!result.ok) {
            throw new HttpError(result.status, body)
        }
        return body as T
    }

    public async get<T>(resource: string): Promise<T> {
        return this.sendRequest(`${this.baseUrl}${resource}`, {headers: this.getHeaders()})
    }

    public async post<T>(resource: string, body: object): Promise<T> {
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers: this.getHeaders(),
            method: "POST",
            body: JSON.stringify(body)
        })
    }

    public async put<T>(resource: string, body: object): Promise<T> {
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers: this.getHeaders(),
            method: "PUT",
            body: JSON.stringify(body)
        })
    }

    public async patch<T>(resource: string, body: object): Promise<T> {
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers: this.getHeaders(),
            method: "PATCH",
            body: JSON.stringify(body)
        })
    }

    public async delete<T>(resource: string): Promise<T> {
        return this.sendRequest(`${this.baseUrl}${resource}`, {
            headers: this.getHeaders(),
            method: "DELETE"
        })
    }

}
