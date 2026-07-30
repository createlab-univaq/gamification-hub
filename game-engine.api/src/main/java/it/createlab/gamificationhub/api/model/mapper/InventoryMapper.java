package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.Inventory;
import it.createlab.gamificationhub.api.model.dto.InventoryDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = ChallengeChoiceMapper.class)
public interface InventoryMapper extends EntityMapper<InventoryDTO, Inventory> {
}
