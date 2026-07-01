package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.ScenarioCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.SimulationScenarioDTO;

import java.util.List;

public interface ScenarioService {

    List<SimulationScenarioDTO> get(ScenarioCriteria criteria);

    SimulationScenarioDTO get(String id);

    SimulationScenarioDTO create(SimulationScenarioDTO scenarioDTO);

    SimulationScenarioDTO update(SimulationScenarioDTO scenarioDTO);

    void delete(String id);

}
