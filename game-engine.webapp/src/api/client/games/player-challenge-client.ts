import {BaseApiClient} from "../base-client.ts";
import type {ChallengeAssignmentDto, ChallengeConceptDto, ChallengeEditDto} from "../../types";

export class PlayerChallengeClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getChallenges(gameId: string, playerId: string) {
        return await this.baseClient.get<ChallengeConceptDto[]>(`/games/${gameId}/players/${playerId}/challenges`)
    }

    public async assignChallenge(gameId: string, playerId: string, assignment: ChallengeAssignmentDto) {
        return await this.baseClient.post<ChallengeConceptDto>(`/games/${gameId}/players/${playerId}/challenges`, assignment)
    }

    public async getChallenge(gameId: string, playerId: string, instanceName: string) {
        return await this.baseClient.get<ChallengeConceptDto>(`/games/${gameId}/players/${playerId}/challenges/${instanceName}`)
    }

    public async editChallenge(gameId: string, playerId: string, instanceName: string, edit: ChallengeEditDto) {
        return await this.baseClient.put<ChallengeConceptDto>(`/games/${gameId}/players/${playerId}/challenges/${instanceName}`, edit)
    }

    public async acceptChallenge(gameId: string, playerId: string, instanceName: string) {
        return await this.baseClient.post<ChallengeConceptDto>(`/games/${gameId}/players/${playerId}/challenges/${instanceName}/accept`, {})
    }

    public async forceChoice(gameId: string, playerId: string) {
        return await this.baseClient.post<ChallengeConceptDto>(`/games/${gameId}/players/${playerId}/challenges/force-choice`, {})
    }

    public async deleteChallenge(gameId: string, playerId: string, instanceName: string) {
        return await this.baseClient.delete(`/games/${gameId}/players/${playerId}/challenges/${instanceName}`)
    }

}
