package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.repo.GamePersistence;
import it.createlab.gamificationhub.api.model.dto.GamePersistanceDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface GamePersistanceMapper extends EntityMapper<GamePersistanceDTO, GamePersistence> {
}
