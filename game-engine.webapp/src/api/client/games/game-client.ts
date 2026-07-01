import {BaseApiClient} from "../base-client.ts";
import type {GameDto, ImportGameDto, RuleImpactDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class GameClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getGames(criteria?: GetFilter<GameDto>[]) {
        return await this.baseClient.get<GameDto[]>(`/games?${buildSearchParams(criteria)}`)
    }

    public async getGame(gameId: string) {
        return await this.baseClient.get<GameDto>(`/games/${gameId}`)
    }

    public async addGame(game: Omit<GameDto, "id">) {
        return await this.baseClient.post<GameDto>(`/games`, game)
    }

    public async importGames(games:ImportGameDto[]) {
        return await this.baseClient.post("/games/import", games)
    }

    public async exportGame(gameId: string) {
        return await this.baseClient.get<ImportGameDto>(`/games/${gameId}/export`)
    }

    public async exportGames(ids: string[]) {
        return await this.baseClient.post<ImportGameDto[]>(`/games/export`, ids)
    }

    public async updateGame(gameId: string, game: GameDto) {
        return await this.baseClient.put<GameDto>(`/games/${gameId}`, game)
    }

    public async deleteGame(gameId: string) {
        return await this.baseClient.delete(`/games/${gameId}`)
    }

    public async staticAnalysis(gameId:string): Promise<RuleImpactDto[]> {
        return await this.baseClient.get<RuleImpactDto[]>(`/games/${gameId}/impact`)
    }

}