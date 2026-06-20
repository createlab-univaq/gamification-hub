export type GetFilter<T> = {
    name: keyof T & string,
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
