import i18n from "../../i18n.ts";

export type Language = "it" | "en"

export function translateErrorMessage(code: string, params?: unknown[]) {
    return translateMessage(`errors:${code}`, params ? {...params} : undefined)
}

export function translateMessage(code: string, options?: Record<string, unknown>) {
    return i18n.t(code, options)
}

export function translateButtonMessage(code:string) {
    return translateMessage(`buttons:${code}`)
}