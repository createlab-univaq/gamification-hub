package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.Level;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.LevelCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.LevelDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.LevelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/levels")
@Tag(name = "Levels", description = "Manage a game's levels and their thresholds")
@Slf4j
public class LevelController extends BaseGameController {

    private final LevelMapper levelMapper;

    public LevelController(GameService gameService, GameMapper gameMapper, LevelMapper levelMapper) {
        super(gameService, gameMapper);
        this.levelMapper = levelMapper;
    }

    @Operation(summary = "List levels", description = "Lists the game's levels, filtered by the given criteria.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<LevelDTO>> getLevels(@PathVariable String gameId, @ParameterObject LevelCriteria criteria) {
        Game game = findGameByIdOrThrow(gameId);
        List<LevelDTO> levels = levelMapper.toDTO(game.getLevels());
        return ResponseEntity.ok(LevelCriteria.filter(criteria, levels));
    }

    @Operation(summary = "Get a level", description = "Returns a single level by name.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{levelId}")
    public ResponseEntity<LevelDTO> getLevel(@PathVariable String gameId, @PathVariable String levelId) {
        Game game = findGameByIdOrThrow(gameId);
        Level level = game.getLevels().stream().filter(l -> l.getName().equalsIgnoreCase(levelId)).findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Level", levelId, ErrorCodes.LEVEL_NOT_FOUND));
        return ResponseEntity.ok(levelMapper.toDTO(level));
    }

    @Operation(summary = "Create or update a level", description = "Creates a new level or updates the existing one with the same name.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<LevelDTO> upsertLevel(@PathVariable String gameId, @RequestBody LevelDTO levelDTO) {
        log.info("REST request to upsert level {} of game {}", levelDTO, gameId);
        Game game = gameService.upsertLevel(gameId, levelMapper.toEntity(levelDTO));
        Level level = game.getLevels().stream().filter(l -> l.getName().equalsIgnoreCase(levelDTO.getName())).findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Level", levelDTO.getName(), ErrorCodes.LEVEL_NOT_FOUND));
        return ResponseEntity.ok(levelMapper.toDTO(level));
    }

    @Operation(summary = "Delete a level", description = "Removes a level from the game by name.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{lvlName}")
    public ResponseEntity<LevelDTO> upsertLevel(@PathVariable String gameId, @PathVariable String lvlName) {
        gameService.deleteLevel(gameId, lvlName);
        return ResponseEntity.noContent().build();
    }

}
