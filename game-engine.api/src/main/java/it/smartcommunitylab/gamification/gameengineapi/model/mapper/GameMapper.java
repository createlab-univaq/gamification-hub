package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.Game;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GameDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface GameMapper extends EntityMapper<GameDTO, Game>{
}
