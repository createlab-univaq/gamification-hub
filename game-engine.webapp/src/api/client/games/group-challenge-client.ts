import {BaseApiClient} from "../base-client.ts";
import type {ChallengeInvitationDto, GroupChallengeDto} from "../../types";

export class GroupChallengeClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getGroupChallenges(gameId: string, playerId: string) {
        return await this.baseClient.get<GroupChallengeDto[]>(`/games/${gameId}/players/${playerId}/group-challenges`)
    }

    public async invite(gameId: string, playerId: string, invitation: ChallengeInvitationDto) {
        return await this.baseClient.post<GroupChallengeDto>(`/games/${gameId}/players/${playerId}/group-challenges/invitations`, invitation)
    }

    public async acceptInvitation(gameId: string, playerId: string, challengeName: string) {
        return await this.baseClient.post<GroupChallengeDto>(`/games/${gameId}/players/${playerId}/group-challenges/${challengeName}/accept`, {})
    }

    public async refuseInvitation(gameId: string, playerId: string, challengeName: string) {
        return await this.baseClient.post<GroupChallengeDto>(`/games/${gameId}/players/${playerId}/group-challenges/${challengeName}/refuse`, {})
    }

    public async cancelInvitation(gameId: string, playerId: string, challengeName: string) {
        return await this.baseClient.post<GroupChallengeDto>(`/games/${gameId}/players/${playerId}/group-challenges/${challengeName}/cancel`, {})
    }

}
