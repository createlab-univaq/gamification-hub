import {BaseApiClient} from "../base-client.ts";
import type {SimulationScenarioDto} from "../../types";
import {buildSearchParams, type GetFilter} from "../../filters/filters.ts";

export class ScenarioClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getScenarios(gameId: string, criteria?: GetFilter<SimulationScenarioDto>[]) {
        return await this.baseClient.get<SimulationScenarioDto[]>(`/games/${gameId}/scenarios?${buildSearchParams(criteria)}`)
    }

    public async getScenario(gameId: string, scenarioId: string) {
        return await this.baseClient.get<SimulationScenarioDto>(`/games/${gameId}/scenarios/${scenarioId}`)
    }

    public async createScenario(gameId: string, scenario: SimulationScenarioDto) {
        return await this.baseClient.post<SimulationScenarioDto>(`/games/${gameId}/scenarios`, scenario)
    }

    public async updateScenario(gameId: string, scenarioId: string, scenario: SimulationScenarioDto) {
        return await this.baseClient.put<SimulationScenarioDto>(`/games/${gameId}/scenarios/${scenarioId}`, scenario)
    }

    public async deleteScenario(gameId: string, scenarioId: string) {
        return await this.baseClient.delete(`/games/${gameId}/scenarios/${scenarioId}`)
    }

}
