package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.impact.ActivationLink;
import eu.trentorise.game.model.impact.RuleImpact;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.impact.ActivationLinkDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.impact.RuleImpactDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = EntityMapper.class, uses = ConceptChangeMapper.class)
public interface RuleImpactMapper {

    @Mapping(target = "ruleName", source = "ruleName")
    RuleImpactDTO toDTO(String ruleName, RuleImpact impact);

    ActivationLinkDTO toDTO(ActivationLink link);
}
