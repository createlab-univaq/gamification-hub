package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.PlayerState;
import it.createlab.gamificationhub.api.model.dto.PlayerSummaryDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface PlayerSummaryMapper extends EntityMapper<PlayerSummaryDTO, PlayerState> {
}
