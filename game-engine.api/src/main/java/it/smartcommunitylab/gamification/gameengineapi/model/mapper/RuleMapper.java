package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.core.ClasspathRule;
import eu.trentorise.game.model.core.DBRule;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface RuleMapper extends EntityMapper<RuleDTO, DBRule> {

    RuleDTO toDTO(ClasspathRule classpathRule);

}
