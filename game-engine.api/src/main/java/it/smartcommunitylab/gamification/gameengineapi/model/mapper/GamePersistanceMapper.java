package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.repo.GamePersistence;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GamePersistanceDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface GamePersistanceMapper extends EntityMapper<GamePersistanceDTO, GamePersistence> {
}
