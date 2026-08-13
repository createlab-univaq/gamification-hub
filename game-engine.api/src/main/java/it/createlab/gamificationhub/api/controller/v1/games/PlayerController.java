package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.services.GameService;
import eu.trentorise.game.services.PlayerService;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.model.dto.PlayerSummaryDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.PlayerStateDTO;
import it.createlab.gamificationhub.api.model.mapper.GameMapper;
import it.createlab.gamificationhub.api.model.mapper.PlayerStateMapper;
import it.createlab.gamificationhub.api.model.mapper.PlayerSummaryMapper;
import it.createlab.gamificationhub.api.service.GroupChallengeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/games/{gameId}/players")
@Tag(name = "Players", description = "Manage the players of a game and their state")
@Slf4j
public class PlayerController extends BaseGameController {

    private final PlayerService playerService;
    private final PlayerStateMapper playerStateMapper;
    private final PlayerSummaryMapper playerSummaryMapper;
    private final GroupChallengeService groupChallengeService;

    public PlayerController(GameService gameService, GameMapper gameMapper, PlayerService playerService, PlayerStateMapper playerStateMapper, PlayerSummaryMapper playerSummaryMapper, GroupChallengeService groupChallengeService) {
        super(gameService, gameMapper);
        this.playerService = playerService;
        this.playerStateMapper = playerStateMapper;
        this.playerSummaryMapper = playerSummaryMapper;
        this.groupChallengeService = groupChallengeService;
    }

    @Operation(summary = "List players", description = "Returns a paged list of player states, optionally filtered by playerId.")
    @GetMapping
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<Page<PlayerSummaryDTO>> getPlayers(
            @PathVariable String gameId,
            @ParameterObject Pageable page,
            @RequestParam(required = false) String playerId
    ) {
        log.info("REST request to get all players of game {}", gameId);
        findGameByIdOrThrow(gameId);
        Page<PlayerState> states = StringUtils.isBlank(playerId)
                ? playerService.loadStates(gameId, page, false, false, true)
                : playerService.loadStates(gameId, playerId, page, false, false, true);
        Page<PlayerSummaryDTO> statesDTO = states.map(playerSummaryMapper::toDTO);
        return ResponseEntity.ok(statesDTO);
    }

    @Operation(summary = "Get a player", description = "Returns a single player's state, enriched with group challenges.")
    @GetMapping("/{playerId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<PlayerStateDTO> getPlayer(@PathVariable String gameId, @PathVariable String playerId) {
        log.info("REST request to get player {} of game {}", playerId, gameId);
        findGameByIdOrThrow(gameId);
        PlayerState state = playerService.loadState(gameId, playerId, false, true);
        if (state == null) {
            throw new EntityNotFoundException("Player", playerId, ErrorCodes.PLAYER_NOT_FOUND);
        }
        PlayerStateDTO dto = playerStateMapper.toDTO(state);
        dto.setGroupChallenges(groupChallengeService.list(gameId, playerId));
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Add a player", description = "Creates or saves a player state.")
    @PostMapping
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<PlayerStateDTO> addPlayer(@PathVariable String gameId, @RequestBody PlayerStateDTO player) {
        log.info("REST request to add player {} to game {}", player, gameId);
        findGameByIdOrThrow(gameId);
        player.setGameId(gameId);
        PlayerState playerState = playerStateMapper.toEntity(player);
        playerState = playerService.saveState(playerState);
        return ResponseEntity.ok(playerStateMapper.toDTO(playerState));
    }

    @Operation(summary = "Delete a player", description = "Deletes a player's state.")
    @DeleteMapping("/{playerId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<Void> deletePlayer(@PathVariable String gameId, @PathVariable String playerId) {
        log.info("REST request to delete player {}", playerId);
        playerService.deleteState(gameId, playerId);
        return ResponseEntity.noContent().build();
    }

}
