interface BaseApiClientProps {
    baseUrl: string
}

export class BaseApiClient {

    private baseUrl: string

    constructor({baseUrl}: BaseApiClientProps) {
        this.baseUrl = baseUrl
    }

    private getHeaders() {
        const headers = new Headers()
        headers.set("Content-Type", "application/json")
        return headers
    }

    private async sendRequest(url: RequestInfo | URL, options?: RequestInit) {
        const result = await fetch(url, {credentials: "include", ...options})
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
