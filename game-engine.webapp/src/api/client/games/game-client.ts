import {BaseApiClient} from "../base-client.ts";
import type {GameDto} from "../../types";

export class GameClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getGames() {
        return await this.baseClient.get<GameDto[]>(`/games`)
    }

    public async getGame(gameId:string) {
        return await this.baseClient.get<GameDto>(`/games/${gameId}`)
    }

    public async addGame(game:Omit<GameDto, "id">) {
        return await this.baseClient.post<GameDto>(`/games`,  game)
    }

    public async updateGame(gameId:string, game:GameDto) {
        return await this.baseClient.put<GameDto>(`/games/${gameId}`, game)
    }

    public async deleteGame(gameId:string) {
        return await this.baseClient.delete(`/games/${gameId}`)
    }

}