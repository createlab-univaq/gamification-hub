package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.simulation.FiredRuleResult;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.FiredRuleDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = {ConceptChangeMapper.class})
public interface FiredRuleMapper extends EntityMapper<FiredRuleDTO, FiredRuleResult>{
}
