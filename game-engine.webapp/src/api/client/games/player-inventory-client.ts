import {BaseApiClient} from "../base-client.ts";
import type {InventoryDto, ItemChoiceDto} from "../../types";

export class PlayerInventoryClient {
    private readonly baseClient: BaseApiClient

    constructor(baseClient: BaseApiClient) {
        this.baseClient = baseClient
    }

    public async getInventory(gameId: string, playerId: string) {
        return await this.baseClient.get<InventoryDto>(`/games/${gameId}/players/${playerId}/inventory`)
    }

    public async activateChoice(gameId: string, playerId: string, choice: ItemChoiceDto) {
        return await this.baseClient.post<InventoryDto>(`/games/${gameId}/players/${playerId}/inventory/activations`, choice)
    }

}
