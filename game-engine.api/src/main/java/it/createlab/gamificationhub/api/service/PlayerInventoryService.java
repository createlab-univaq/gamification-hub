package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.dto.InventoryDTO;
import it.createlab.gamificationhub.api.model.dto.ItemChoiceDTO;

public interface PlayerInventoryService {

    InventoryDTO getInventory(String gameId, String playerId);

    InventoryDTO activateChoice(String gameId, String playerId, ItemChoiceDTO choice);

}
