import {BaseApiClient} from "../base-client.ts";
import type {ActionDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class ActionClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getActions(gameId: string, criteria?: GetFilter<ActionDto>[]) {
        return await this.baseClient.get<ActionDto[]>(`/games/${gameId}/actions?${buildSearchParams(criteria)}`)
    }

    public async addAction(gameId: string, action: ActionDto) {
        return await this.baseClient.post<ActionDto>(`/games/${gameId}/actions`, action)
    }

    public async updateAction(gameId: string, actionId: string, action: ActionDto) {
        return await this.baseClient.put<ActionDto>(`/games/${gameId}/actions/${actionId}`, action)
    }

    public async deleteAction(gameId: string, actionId: string) {
        return await this.baseClient.delete(`/games/${gameId}/actions/${actionId}`)
    }

}