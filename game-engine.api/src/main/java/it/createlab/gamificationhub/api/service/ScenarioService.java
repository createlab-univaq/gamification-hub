package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.criteria.ScenarioCriteria;
import it.createlab.gamificationhub.api.model.dto.SimulationScenarioDTO;

import java.util.List;

public interface ScenarioService {

    List<SimulationScenarioDTO> get(ScenarioCriteria criteria);

    SimulationScenarioDTO get(String id);

    SimulationScenarioDTO create(SimulationScenarioDTO scenarioDTO);

    SimulationScenarioDTO update(SimulationScenarioDTO scenarioDTO);

    void delete(String id);

}
