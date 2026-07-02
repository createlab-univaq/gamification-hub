package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.services.GameService;
import eu.trentorise.game.services.PlayerService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PlayerDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PlayerStateDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.PlayerMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.PlayerStateMapper;
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
@Slf4j
public class PlayerController extends BaseGameController {

    private final PlayerService playerService;
    private final PlayerMapper playerMapper;
    private final PlayerStateMapper playerStateMapper;

    public PlayerController(GameService gameService, GameMapper gameMapper, PlayerService playerService, PlayerMapper playerMapper, PlayerStateMapper playerStateMapper) {
        super(gameService, gameMapper);
        this.playerService = playerService;
        this.playerMapper = playerMapper;
        this.playerStateMapper = playerStateMapper;
    }

    @GetMapping
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<Page<PlayerDTO>> getPlayers(
            @PathVariable String gameId,
            @ParameterObject Pageable page,
            @RequestParam(required = false) String playerId
    ) {
        log.info("REST request to get all players of game {}", gameId);
        findGameByIdOrThrow(gameId);
        Page<PlayerState> states = StringUtils.isBlank(playerId)
                ? playerService.loadStates(gameId, page, false)
                : playerService.loadStates(gameId, playerId, page, false, false);
        Page<PlayerDTO> statesDTO = states.map(playerMapper::toDTO);
        return ResponseEntity.ok(statesDTO);
    }

    @GetMapping("/{playerId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<PlayerStateDTO> getPlayer(@PathVariable String gameId, @PathVariable String playerId) {
        log.info("REST request to get player {} of game {}", playerId, gameId);
        findGameByIdOrThrow(gameId);
        PlayerState state = playerService.loadState(gameId, playerId, false, false);
        if (state == null) {
            throw new EntityNotFoundException("Player", playerId, ErrorCodes.PLAYER_NOT_FOUND);
        }
        return ResponseEntity.ok(playerStateMapper.toDTO(state));
    }

    @PostMapping
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<PlayerDTO> addPlayer(@PathVariable String gameId, @RequestBody PlayerDTO player) {
        log.info("REST request to add player {} to game {}", gameId, player);
        PlayerState playerState = playerMapper.toEntity(player);
        playerState = playerService.saveState(playerState);
        return ResponseEntity.ok(playerMapper.toDTO(playerState));
    }

    @DeleteMapping("/{playerId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<Void> deletePlayer(@PathVariable String gameId, @PathVariable String playerId) {
        log.info("REST request to delete player {}", playerId);
        playerService.deleteState(gameId, playerId);
        return ResponseEntity.noContent().build();
    }

}
