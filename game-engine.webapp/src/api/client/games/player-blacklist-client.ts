import {BaseApiClient} from "../base-client.ts";
import type {PlayerBlackListDto} from "../../types";

export class PlayerBlackListClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getBlackList(gameId: string, playerId: string) {
        return await this.baseClient.get<PlayerBlackListDto>(`/games/${gameId}/players/${playerId}/blacklist`)
    }

    public async blockPlayer(gameId: string, playerId: string, otherPlayerId: string) {
        return await this.baseClient.post<PlayerBlackListDto>(`/games/${gameId}/players/${playerId}/blacklist/${otherPlayerId}`, {})
    }

    public async unblockPlayer(gameId: string, playerId: string, otherPlayerId: string) {
        return await this.baseClient.delete<PlayerBlackListDto>(`/games/${gameId}/players/${playerId}/blacklist/${otherPlayerId}`)
    }

}
