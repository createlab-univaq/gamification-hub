package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.BadgeCollectionConcept;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.BadgeCollectionDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface BadgeCollectionMapper extends EntityMapper<BadgeCollectionDTO, BadgeCollectionConcept> {
}
