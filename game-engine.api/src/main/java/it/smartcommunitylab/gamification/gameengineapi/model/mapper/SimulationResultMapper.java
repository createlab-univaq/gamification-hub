package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.simulation.SimulationResult;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationResultDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = {FiredRuleMapper.class, ConceptChangeMapper.class, PlayerStateMapper.class})
public interface SimulationResultMapper extends EntityMapper<SimulationResultDTO, SimulationResult> {
}
