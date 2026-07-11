import {BaseApiClient} from "../base-client.ts";
import type {SimulationRequestDto, SimulationResultDto} from "../../types";

export class SimulationClient {
    private client: BaseApiClient;

    constructor(client: BaseApiClient) {
        this.client = client;
    }

    public async simulate(request: SimulationRequestDto): Promise<SimulationResultDto> {
        return await this.client.post<SimulationResultDto>('/executions/simulations', request);
    }

}
