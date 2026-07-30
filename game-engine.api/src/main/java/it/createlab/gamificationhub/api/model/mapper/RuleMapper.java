package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.core.ClasspathRule;
import eu.trentorise.game.model.core.DBRule;
import it.createlab.gamificationhub.api.model.dto.RuleDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface RuleMapper extends EntityMapper<RuleDTO, DBRule> {

    RuleDTO toDTO(ClasspathRule classpathRule);

}
