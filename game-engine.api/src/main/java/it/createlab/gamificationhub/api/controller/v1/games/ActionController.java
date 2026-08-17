package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.managers.GameManager;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.GameTask;
import eu.trentorise.game.services.GameService;
import it.createlab.gamificationhub.api.exception.EntityCreationException;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.model.criteria.ActionCriteria;
import it.createlab.gamificationhub.api.model.dto.ActionDTO;
import it.createlab.gamificationhub.api.model.mapper.GameMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games/{gameId}/actions")
@Tag(name = "Actions", description = "Manage the actions a game can react to")
@Slf4j
public class ActionController extends BaseGameController {
    public ActionController(GameService gameService, GameMapper gameMapper) {
        super(gameService, gameMapper);
    }

    @Operation(summary = "List actions", description = "Lists the game's actions filtered by the given criteria")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<ActionDTO>> getActions(@PathVariable String gameId, @ParameterObject ActionCriteria criteria) {
        log.info("REST request to get Actions of game {} by criteria={}", gameId, criteria);
        Game game = findGameByIdOrThrow(gameId);
        Set<String> derived = derivedActions(game);
        List<ActionDTO> actions = game.getActions()
                .stream()
                .filter(name -> !derived.contains(name))
                .map(ActionDTO::new)
                .toList();
        return ResponseEntity.ok(ActionCriteria.filter(criteria, actions));
    }

    @Operation(summary = "Add action", description = "Adds a new action to the game. Rejects a name that already exists.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<ActionDTO> addAction(@PathVariable String gameId, @RequestBody ActionDTO action) {
        log.info("REST request to add Action {} to game {}", action, gameId);
        Game game = findGameByIdOrThrow(gameId);
        rejectReservedName(action.getName());
        if (game.getActions().contains(action.getName())) {
            throw new EntityCreationException("Action", "Action %s already exists".formatted(action.getName()), ErrorCodes.ACTION_CREATION);
        }
        game.getActions().add(action.getName());
        gameService.saveGameDefinition(game);
        return ResponseEntity.ok(action);
    }

    @Operation(summary = "Rename an action", description = "Replaces an existing action with a new name.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{actionId}")
    public ResponseEntity<ActionDTO> updateAction(@PathVariable String gameId, @PathVariable String actionId, @RequestBody ActionDTO action) {
        log.info("REST request to update Action {} to {} in game {}", actionId, action, gameId);
        Game game = findGameByIdOrThrow(gameId);
        if (!game.getActions().contains(actionId) || derivedActions(game).contains(actionId)) {
            throw new EntityNotFoundException("Action", actionId, ErrorCodes.ACTION_NOT_FOUND);
        }
        rejectReservedName(action.getName());
        game.getActions().remove(actionId);
        game.getActions().add(action.getName());
        gameService.saveGameDefinition(game);
        return ResponseEntity.ok(action);
    }

    @Operation(summary = "Delete an action", description = "Removes an action from the game.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{actionId}")
    public ResponseEntity<Void> deleteAction(@PathVariable String gameId, @PathVariable String actionId) {
        log.info("REST request to delete Action {} of game {}", actionId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        if (derivedActions(game).contains(actionId)) {
            throw new EntityNotFoundException("Action", actionId, ErrorCodes.ACTION_NOT_FOUND);
        }
        game.getActions().remove(actionId);
        gameService.saveGameDefinition(game);
        return ResponseEntity.noContent().build();
    }

    /**
     * Actions a scheduled task brings into the game are derived state: the engine rebuilds them from
     * the game's tasks on every save, so they cannot be renamed or removed on their own. They are
     * computed from the same source that writes them rather than matched by prefix, so an action a
     * user happens to name with the internal prefix stays entirely theirs to manage.
     */
    private Set<String> derivedActions(Game game) {
        if (game.getTasks() == null) {
            return Set.of();
        }
        return game.getTasks().stream()
                .map(GameTask::retrieveActions)
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .collect(Collectors.toSet());
    }

    /**
     * The engine strips the internal prefix from the action set when it persists a game, so a name
     * carrying it would be silently dropped instead of saved. Refusing it here reports that
     * constraint rather than hiding it behind a successful response.
     */
    private void rejectReservedName(String name) {
        if (name != null && name.startsWith(GameManager.INTERNAL_ACTION_PREFIX)) {
            throw new EntityCreationException("Action",
                    "Action names starting with %s are reserved for the engine's internal events"
                            .formatted(GameManager.INTERNAL_ACTION_PREFIX),
                    ErrorCodes.ACTION_NAME_RESERVED,
                    List.<Object>of(GameManager.INTERNAL_ACTION_PREFIX));
        }
    }

}
