package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.dto.simulation.SimulationRequestDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.SimulationResultDTO;

public interface SimulationService {

    SimulationResultDTO simulate(SimulationRequestDTO simulationRequestDTO);

}
