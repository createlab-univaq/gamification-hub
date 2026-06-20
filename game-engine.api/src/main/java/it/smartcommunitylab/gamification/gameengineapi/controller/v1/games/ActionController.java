package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.ActionCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ActionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/actions")
@Slf4j
public class ActionController extends BaseGameController {
    public ActionController(GameService gameService, GameMapper gameMapper) {
        super(gameService, gameMapper);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<ActionDTO>> getActions(@PathVariable String gameId, @ParameterObject ActionCriteria criteria) {
        log.info("REST request to get Actions of game {} by criteria={}", gameId, criteria);
        Game game = findGameByIdOrThrow(gameId);
        List<ActionDTO> actions = game.getActions()
                .stream()
                .map(ActionDTO::new)
                .toList();
        return ResponseEntity.ok(ActionCriteria.filter(criteria, actions));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<ActionDTO> addAction(@PathVariable String gameId, @RequestBody ActionDTO action) {
        log.info("REST request to add Action {} to game {}", action, gameId);
        Game game = findGameByIdOrThrow(gameId);
        if (game.getActions().contains(action.getName())) {
            throw new EntityCreationException("Action", "Action %s already exists".formatted(action.getName()));
        }
        game.getActions().add(action.getName());
        gameService.saveGameDefinition(game);
        return ResponseEntity.ok(action);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{actionId}")
    public ResponseEntity<ActionDTO> updateAction(@PathVariable String gameId, @PathVariable String actionId, @RequestBody ActionDTO action) {
        log.info("REST request to update Action {} to {} in game {}", actionId, action, gameId);
        Game game = findGameByIdOrThrow(gameId);
        if (!game.getActions().contains(actionId)) {
            throw new EntityNotFoundException("Action", actionId);
        }
        game.getActions().remove(actionId);
        game.getActions().add(action.getName());
        gameService.saveGameDefinition(game);
        return ResponseEntity.ok(action);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{actionId}")
    public ResponseEntity<Void> deleteAction(@PathVariable String gameId, @PathVariable String actionId) {
        log.info("REST request to delete Action {} of game {}", actionId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        game.getActions().remove(actionId);
        gameService.saveGameDefinition(game);
        return ResponseEntity.noContent().build();
    }

}
