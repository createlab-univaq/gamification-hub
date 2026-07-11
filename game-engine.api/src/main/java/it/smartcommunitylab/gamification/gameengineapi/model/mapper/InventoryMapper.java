package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.Inventory;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.InventoryDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = ChallengeChoiceMapper.class)
public interface InventoryMapper extends EntityMapper<InventoryDTO, Inventory> {
}
