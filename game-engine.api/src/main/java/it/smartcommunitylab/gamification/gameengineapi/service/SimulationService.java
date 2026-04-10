package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationResultDTO;

public interface SimulationService {

    SimulationResultDTO simulate(String gameId, String actionId, SimulationRequestDTO simulationRequestDTO);

}
