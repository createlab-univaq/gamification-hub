package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.BadgeCollectionConcept;
import it.createlab.gamificationhub.api.model.dto.BadgeCollectionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = EntityMapper.class)
public interface BadgeCollectionMapper extends EntityMapper<BadgeCollectionDTO, BadgeCollectionConcept> {

    @Override
    @Mapping(target = "badgeEarned", source = "badges")
    BadgeCollectionConcept toEntity(BadgeCollectionDTO dto);

    @Override
    @Mapping(target = "badges", source = "badgeEarned")
    BadgeCollectionDTO toDTO(BadgeCollectionConcept entity);

    @Override
    @Mapping(target = "badgeEarned", source = "badges")
    void updateEntity(@MappingTarget BadgeCollectionConcept entity, BadgeCollectionDTO dto);

}
