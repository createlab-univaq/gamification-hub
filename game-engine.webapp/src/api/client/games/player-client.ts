import {BaseApiClient} from "../base-client.ts";
import type {PagePlayerSummaryDto, PlayerStateDto, PlayerSummaryDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class PlayerClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getPlayers(gameId: string, criteria?: GetFilter<PlayerSummaryDto>[]) {
        return await this.baseClient.get<PagePlayerSummaryDto>(`/games/${gameId}/players?${buildSearchParams(criteria)}`)
    }

    public async getPlayer(gameId: string, playerId: string) {
        return await this.baseClient.get<PlayerStateDto>(`/games/${gameId}/players/${playerId}`)
    }

    public async addPlayer(gameId: string, player: PlayerStateDto) {
        return await this.baseClient.post<PlayerStateDto>(`/games/${gameId}/players`, player)
    }

    public async deletePlayer(gameId: string, playerId: string) {
        return await this.baseClient.delete(`/games/${gameId}/players/${playerId}`)
    }

}