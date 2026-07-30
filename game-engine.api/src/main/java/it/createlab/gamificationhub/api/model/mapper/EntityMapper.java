package it.createlab.gamificationhub.api.model.mapper;

import org.mapstruct.*;

import java.util.Collection;
import java.util.List;

@MapperConfig(
        componentModel = MappingConstants.ComponentModel.SPRING,
        nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL,
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface EntityMapper<DTO, ENTITY> {

    ENTITY toEntity(DTO dto);

    List<ENTITY> toEntity(Collection<DTO> dtos);

    DTO toDTO(ENTITY entity);

    List<DTO> toDTO(Collection<ENTITY> entities);

    void updateEntity(@MappingTarget ENTITY entity, DTO dto);

    void updateDTO(@MappingTarget DTO dto, ENTITY entity);

}
