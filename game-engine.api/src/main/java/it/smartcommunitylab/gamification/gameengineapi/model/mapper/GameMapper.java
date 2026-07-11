package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.Game;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GameDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = EntityMapper.class)
public interface GameMapper extends EntityMapper<GameDTO, Game>{

    @Override
    @Mapping(target = "actions", ignore = true)
    @Mapping(target = "rules", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "concepts", ignore = true)
    void updateEntity(@MappingTarget Game entity, GameDTO dto);
}
