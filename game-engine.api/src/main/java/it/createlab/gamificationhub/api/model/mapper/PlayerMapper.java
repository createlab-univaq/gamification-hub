package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.CustomData;
import eu.trentorise.game.model.PlayerState;
import it.createlab.gamificationhub.api.model.dto.PlayerDTO;
import org.mapstruct.*;

@Mapper(config = EntityMapper.class)
public interface PlayerMapper extends EntityMapper<PlayerDTO, PlayerState>{

    @Named("customDataFactory")
    default CustomData customDataFactory(CustomData customData) {
        CustomData customData1 = new CustomData();
        customData.setData(customData.getData());
        return customData1;
    }

    @Override
    @Mapping(target = "customData", qualifiedByName = "customDataFactory")
    void updateDTO(@MappingTarget PlayerDTO playerDTO, PlayerState playerState);

    @Override
    @Mapping(target = "customData", qualifiedByName = "customDataFactory")
    void updateEntity(@MappingTarget PlayerState playerState, PlayerDTO playerDTO);

}
