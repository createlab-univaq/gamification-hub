package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.simulation.FiredRuleResult;
import it.createlab.gamificationhub.api.model.dto.simulation.FiredRuleDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = {ConceptChangeMapper.class})
public interface FiredRuleMapper extends EntityMapper<FiredRuleDTO, FiredRuleResult>{
}
