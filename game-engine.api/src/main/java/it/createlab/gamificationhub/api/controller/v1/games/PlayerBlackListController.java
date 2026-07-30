package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.model.PlayerBlackList;
import eu.trentorise.game.services.PlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.createlab.gamificationhub.api.model.dto.PlayerBlackListDTO;
import it.createlab.gamificationhub.api.model.mapper.PlayerBlackListMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/games/{gameId}/players/{playerId}/blacklist")
@Tag(name = "Player Blacklist", description = "Manage the players a player has blocked")
@Slf4j
@RequiredArgsConstructor
public class PlayerBlackListController {

    private final PlayerService playerService;
    private final PlayerBlackListMapper playerBlackListMapper;

    @Operation(summary = "Get blacklist", description = "Returns the players blocked by the given player.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<PlayerBlackListDTO> getBlackList(@PathVariable String gameId, @PathVariable String playerId) {
        log.info("Get blacklist of player={} in game={}", playerId, gameId);
        PlayerBlackList blackList = playerService.readBlackList(gameId, playerId);
        return ResponseEntity.ok(playerBlackListMapper.toDTO(blackList));
    }

    @Operation(summary = "Block a player", description = "Adds another player to the given player's blacklist.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/{otherPlayerId}")
    public ResponseEntity<PlayerBlackListDTO> blockPlayer(@PathVariable String gameId, @PathVariable String playerId,
            @PathVariable String otherPlayerId) {
        log.info("Player={} blocks player={} in game={}", playerId, otherPlayerId, gameId);
        PlayerBlackList blackList = playerService.blockPlayer(gameId, playerId, otherPlayerId);
        return ResponseEntity.ok(playerBlackListMapper.toDTO(blackList));
    }

    @Operation(summary = "Unblock a player", description = "Removes another player from the given player's blacklist.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{otherPlayerId}")
    public ResponseEntity<PlayerBlackListDTO> unblockPlayer(@PathVariable String gameId, @PathVariable String playerId,
            @PathVariable String otherPlayerId) {
        log.info("Player={} unblocks player={} in game={}", playerId, otherPlayerId, gameId);
        PlayerBlackList blackList = playerService.unblockPlayer(gameId, playerId, otherPlayerId);
        return ResponseEntity.ok(playerBlackListMapper.toDTO(blackList));
    }

}
