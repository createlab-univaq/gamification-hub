package it.createlab.gamificationhub.api.model.mapper;

import it.createlab.gamificationhub.api.model.dto.SimulationScenarioDTO;
import it.createlab.gamificationhub.api.model.entity.SimulationScenario;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ScenarioMapper extends EntityMapper<SimulationScenarioDTO, SimulationScenario> {

}
