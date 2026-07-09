package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.InventoryDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ItemChoiceDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.PlayerInventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/games/{gameId}/players/{playerId}/inventory")
@Slf4j
@RequiredArgsConstructor
public class PlayerInventoryController {

    private final PlayerInventoryService playerInventoryService;

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<InventoryDTO> getInventory(@PathVariable String gameId,
            @PathVariable String playerId) {
        log.info("Get inventory of player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(playerInventoryService.getInventory(gameId, playerId));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/activations")
    public ResponseEntity<InventoryDTO> activateChoice(@PathVariable String gameId,
            @PathVariable String playerId, @RequestBody ItemChoiceDTO choice) {
        log.info("Activate choice for player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(playerInventoryService.activateChoice(gameId, playerId, choice));
    }

}
