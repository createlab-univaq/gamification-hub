package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.PlayerBlackList;
import it.createlab.gamificationhub.api.model.dto.PlayerBlackListDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface PlayerBlackListMapper extends EntityMapper<PlayerBlackListDTO, PlayerBlackList> {
}
