export type GetFilter<T> = {
    // keyof T keeps DTO-field intellisense; (string & {}) widens it to accept
    // extra query params (page, size, ...) without losing the suggestions
    name: (keyof T & string) | (string & {}),
    value: string
}

export function buildSearchParams<T>(filters?: GetFilter<T>[]) {
    if (!filters) {
        return ""
    }
    const params = new URLSearchParams()
    for (const filter of filters) {
        params.set(filter.name, filter.value)
    }
    return params.toString()
}
