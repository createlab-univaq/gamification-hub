package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.simulation.SimulationResult;
import it.createlab.gamificationhub.api.model.dto.simulation.SimulationResultDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = {FiredRuleMapper.class, ConceptChangeMapper.class, PlayerStateMapper.class})
public interface SimulationResultMapper extends EntityMapper<SimulationResultDTO, SimulationResult> {
}
