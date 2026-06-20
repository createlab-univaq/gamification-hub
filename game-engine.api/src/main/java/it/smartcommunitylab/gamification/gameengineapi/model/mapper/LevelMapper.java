package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.Level;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.LevelDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface LevelMapper extends EntityMapper<LevelDTO, Level> {
}
