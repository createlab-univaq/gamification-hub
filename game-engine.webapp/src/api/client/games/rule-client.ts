import {BaseApiClient} from "../base-client.ts";
import type {RuleDto, ValidateRuleData, ValidationMessageDto} from "../../types";
import type {GetFilter} from "../../types/filters.ts";
import {buildSearchParams} from "../../filters/filters.ts";

export class RuleClient {

    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getRules(gameId: string, criteria?: GetFilter<Omit<RuleDto, "content">>[]) {
        return await this.baseClient.get<RuleDto[]>(`/games/${gameId}/rules?${buildSearchParams(criteria)}`)
    }

    public async getRule(gameId: string, ruleId: string) {
        return await this.baseClient.get<RuleDto>(`/games/${gameId}/rules/${ruleId}`)
    }

    public async addRule(rule: Omit<RuleDto, "id">) {
        return await this.baseClient.post<RuleDto>(`/games/${rule.gameId}/rules`, rule)
    }

    public async updateRule(ruleId: string, rule: RuleDto) {
        return await this.baseClient.put<RuleDto>(`/games/${rule.gameId}/rules/${ruleId}`, rule)
    }

    public async deleteRule(gameId: string, ruleId: string) {
        return await this.baseClient.delete(`/games/${gameId}/rules/${ruleId}`)
    }

    public async validateRule(rule: RuleDto) {
        return await this.baseClient.post<ValidationMessageDto[]>(`/games/${rule.gameId}/rules/validate`, rule)
    }

}