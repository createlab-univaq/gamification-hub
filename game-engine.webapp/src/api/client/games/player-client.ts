import {BaseApiClient} from "../base-client.ts";
import type {PagePlayerDto, PlayerDto, PlayerStateDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class PlayerClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getPlayers(gameId: string, criteria?: GetFilter<PlayerDto>[]) {
        return await this.baseClient.get<PagePlayerDto>(`/games/${gameId}/players?${buildSearchParams(criteria)}`)
    }

    public async getPlayer(gameId: string, playerId: string) {
        return await this.baseClient.get<PlayerStateDto>(`/games/${gameId}/players/${playerId}`)
    }

    public async addPlayer(gameId: string, player: PlayerDto) {
        return await this.baseClient.post<PlayerDto>(`/games/${gameId}/players`, player)
    }

    public async deletePlayer(gameId: string, playerId: string) {
        return await this.baseClient.delete(`/games/${gameId}/players/${playerId}`)
    }

}