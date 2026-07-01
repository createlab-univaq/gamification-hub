package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.SimulationScenarioDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.entity.SimulationScenario;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ScenarioMapper extends EntityMapper<SimulationScenarioDTO, SimulationScenario> {

}
