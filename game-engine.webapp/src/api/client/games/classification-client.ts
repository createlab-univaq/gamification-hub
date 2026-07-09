import {BaseApiClient} from "../base-client.ts";
import type {ClassificationDto, ClassificationBoardDto} from "../../types";
import type {GetFilter} from "../../filters/filters.ts";
import {buildSearchParams} from "../../filters/filters.ts";

export class ClassificationClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getClassifications(gameId: string, criteria:GetFilter<ClassificationDto>[]) {

        return await this.baseClient.get<ClassificationDto[]>(`/games/${gameId}/classifications?${buildSearchParams(criteria)}`)
    }

    public async getClassification(gameId: string, classificationId: string) {
        return await this.baseClient.get<ClassificationDto>(`/games/${gameId}/classifications/${classificationId}`)
    }

    public async createClassification(gameId: string, classification: ClassificationDto) {
        return await this.baseClient.post<ClassificationDto>(`/games/${gameId}/classifications`, classification)
    }

    public async updateClassification(gameId: string, classificationId: string, classification: ClassificationDto) {
        return await this.baseClient.put<ClassificationDto>(`/games/${gameId}/classifications/${classificationId}`, classification)
    }

    public async deleteClassification(gameId: string, classificationId: string) {
        return await this.baseClient.delete(`/games/${gameId}/classifications/${classificationId}`)
    }

    public async getBoard(gameId: string, classificationId: string, criteria: GetFilter<ClassificationBoardDto>[]) {
        return await this.baseClient.get<ClassificationBoardDto>(`/games/${gameId}/classifications/${classificationId}/board?${buildSearchParams(criteria)}`)
    }

}
