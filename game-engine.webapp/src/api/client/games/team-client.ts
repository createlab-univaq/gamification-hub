import {BaseApiClient} from "../base-client.ts";
import type {TeamDto} from "../../types";

export class TeamClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getTeams(gameId: string) {
        return await this.baseClient.get<TeamDto[]>(`/games/${gameId}/teams`)
    }

    public async getTeam(gameId: string, teamId: string) {
        return await this.baseClient.get<TeamDto>(`/games/${gameId}/teams/${teamId}`)
    }

    public async createTeam(gameId: string, team: TeamDto) {
        return await this.baseClient.post<TeamDto>(`/games/${gameId}/teams`, team)
    }

    public async updateTeam(gameId: string, teamId: string, team: TeamDto) {
        return await this.baseClient.put<TeamDto>(`/games/${gameId}/teams/${teamId}`, team)
    }

    public async deleteTeam(gameId: string, teamId: string) {
        return await this.baseClient.delete(`/games/${gameId}/teams/${teamId}`)
    }

}
