package it.createlab.gamificationhub.api.service.impl;

import eu.trentorise.game.model.Inventory;
import eu.trentorise.game.model.Inventory.ItemChoice;
import eu.trentorise.game.model.Inventory.ItemChoice.ChoiceType;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.services.PlayerService;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.exception.RequestException;
import it.createlab.gamificationhub.api.model.dto.InventoryDTO;
import it.createlab.gamificationhub.api.model.dto.ItemChoiceDTO;
import it.createlab.gamificationhub.api.model.mapper.InventoryMapper;
import it.createlab.gamificationhub.api.service.PlayerInventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlayerInventoryServiceImpl implements PlayerInventoryService {

    private final PlayerService playerService;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryDTO getInventory(String gameId, String playerId) {
        PlayerState state = playerService.loadState(gameId, playerId, false, false);
        if (state == null) {
            throw new EntityNotFoundException("Player", playerId, ErrorCodes.PLAYER_NOT_FOUND);
        }
        return inventoryMapper.toDTO(state.getInventory());
    }

    @Override
    public InventoryDTO activateChoice(String gameId, String playerId, ItemChoiceDTO choice) {
        ItemChoice itemChoice = new ItemChoice(resolveType(choice.getType()), choice.getName());
        try {
            Inventory inventory = playerService.choiceActivation(gameId, playerId, itemChoice);
            log.info("Activated choice {} for player {} in game {}", choice.getName(), playerId, gameId);
            return inventoryMapper.toDTO(inventory);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid choice activation", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    private ChoiceType resolveType(String type) {
        if (StringUtils.isBlank(type)) {
            return ChoiceType.CHALLENGE_MODEL;
        }
        try {
            return ChoiceType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid choice activation",
                    "Unknown choice type %s".formatted(type),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

}
