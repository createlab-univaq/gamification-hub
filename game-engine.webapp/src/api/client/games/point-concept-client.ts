import {BaseApiClient} from "../base-client.ts";
import type {PointConceptDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class PointConceptClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getPointConcepts(gameId: string, criteria?: GetFilter<PointConceptDto>[]) {
        return await this.baseClient.get<PointConceptDto[]>(`/games/${gameId}/point-concepts?${buildSearchParams(criteria)}`)
    }

    public async getPointConcept(gameId: string, pcId: string) {
        return await this.baseClient.get<PointConceptDto>(`/games/${gameId}/point-concepts/${pcId}`)
    }

    public async addPointConcept(gameId: string, pc: PointConceptDto) {
        return await this.baseClient.post<PointConceptDto>(`/games/${gameId}/point-concepts`, pc)
    }

    public async updatePointConcept(gameId: string, pc: PointConceptDto) {
        return await this.baseClient.patch<PointConceptDto>(`/games/${gameId}/point-concepts/${pc.id}`, pc)
    }

    public async deletePointConcept(gameId: string, pcId: string) {
        return await this.baseClient.delete(`/games/${gameId}/point-concepts/${pcId}`)
    }

}