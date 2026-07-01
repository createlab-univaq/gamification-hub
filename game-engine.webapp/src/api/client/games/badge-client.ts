import {BaseApiClient} from "../base-client.ts";
import type {BadgeCollectionDto} from "../../types";

export class BadgeClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getBadges(gameId: string) {
        return await this.baseClient.get<BadgeCollectionDto[]>(`/games/${gameId}/badges`)
    }

    public async getBadge(gameId: string, badgeId: string) {
        return await this.baseClient.get<BadgeCollectionDto>(`/games/${gameId}/badges/${badgeId}`)
    }

    public async addBadge(gameId: string, badge: BadgeCollectionDto) {
        return await this.baseClient.post<BadgeCollectionDto>(`/games/${gameId}/badges`, badge)
    }

    public async updateBadge(gameId: string, badgeId: string, badge: BadgeCollectionDto) {
        return await this.baseClient.put<BadgeCollectionDto>(`/games/${gameId}/badges/${badgeId}`, badge)
    }

    public async deleteBadge(gameId: string, badgeId: string) {
        return await this.baseClient.delete(`/games/${gameId}/badges/${badgeId}`)
    }

}
