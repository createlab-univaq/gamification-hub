package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import org.mapstruct.*;

import java.util.Collection;

@MapperConfig(
        componentModel = MappingConstants.ComponentModel.SPRING,
        nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL,
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED
)
public interface EntityMapper<DTO, ENTITY> {

    ENTITY toEntity(DTO dto);

    Collection<ENTITY> toEntity(Collection<DTO> dtos);

    DTO toDTO(ENTITY entity);

    Collection<DTO> toDTO(Collection<ENTITY> entities);

    void updateEntity(@MappingTarget ENTITY entity, DTO dto);

    void updateDTO(@MappingTarget DTO dto, ENTITY entity);

}
