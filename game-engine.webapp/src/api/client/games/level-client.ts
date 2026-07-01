import {BaseApiClient} from "../base-client.ts";
import type {LevelDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class LevelClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getLevels(gameId: string, criteria?: GetFilter<LevelDto>[]) {
        return await this.baseClient.get<LevelDto[]>(`/games/${gameId}/levels?${buildSearchParams(criteria)}`)
    }

    public async getLevel(gameId: string, levelName: string) {
        return await this.baseClient.get<LevelDto>(`/games/${gameId}/levels/${levelName}`)
    }

    public async upsertLevel(gameId: string, level: LevelDto) {
        return await this.baseClient.post<LevelDto>(`/games/${gameId}/levels`, level)
    }

    public async deleteLevel(gameId: string, levelName: string) {
        return await this.baseClient.delete(`/games/${gameId}/levels/${levelName}`)
    }

}