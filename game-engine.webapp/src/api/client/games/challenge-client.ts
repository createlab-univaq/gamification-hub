import {BaseApiClient} from "../base-client.ts";
import type {ChallengeDto} from "../../types";

export class ChallengeClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getChallenges(gameId: string) {
        return await this.baseClient.get<ChallengeDto[]>(`/games/${gameId}/challenges`)
    }

    public async addChallenge(gameId: string, challenge: ChallengeDto) {
        return await this.baseClient.post<ChallengeDto>(`/games/${gameId}/challenges`, challenge)
    }

    public async updateChallenge(gameId: string, challengeId: string, challenge: ChallengeDto) {
        return await this.baseClient.put<ChallengeDto>(`/games/${gameId}/challenges/${challengeId}`, challenge)
    }

    public async deleteChallenge(gameId: string, challengeId: string) {
        return await this.baseClient.delete(`/games/${gameId}/challenges/${challengeId}`)
    }

}
