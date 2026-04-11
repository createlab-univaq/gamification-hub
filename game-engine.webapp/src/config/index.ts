interface AppConfigs {
    readonly baseApiUrl:string
}

export const appConfig = {
    baseApiUrl: import.meta.env.VITE_GAMIFICATION_API_BASE_URL
} satisfies AppConfigs
