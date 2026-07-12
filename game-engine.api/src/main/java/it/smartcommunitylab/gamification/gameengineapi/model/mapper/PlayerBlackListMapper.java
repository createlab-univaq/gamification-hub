package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.PlayerBlackList;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PlayerBlackListDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface PlayerBlackListMapper extends EntityMapper<PlayerBlackListDTO, PlayerBlackList> {
}
