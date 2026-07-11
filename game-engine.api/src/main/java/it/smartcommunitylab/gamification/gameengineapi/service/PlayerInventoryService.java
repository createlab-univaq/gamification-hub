package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.InventoryDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ItemChoiceDTO;

public interface PlayerInventoryService {

    InventoryDTO getInventory(String gameId, String playerId);

    InventoryDTO activateChoice(String gameId, String playerId, ItemChoiceDTO choice);

}
