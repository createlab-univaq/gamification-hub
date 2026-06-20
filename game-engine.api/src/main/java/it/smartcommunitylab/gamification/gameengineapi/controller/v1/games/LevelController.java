package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.Level;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.LevelCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.LevelDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.LevelMapper;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/levels")
@Slf4j
public class LevelController extends BaseGameController {

    private final LevelMapper levelMapper;

    public LevelController(GameService gameService, GameMapper gameMapper, LevelMapper levelMapper) {
        super(gameService, gameMapper);
        this.levelMapper = levelMapper;
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<LevelDTO>> getLevels(@PathVariable String gameId, @ParameterObject LevelCriteria criteria) {
        Game game = findGameByIdOrThrow(gameId);
        List<LevelDTO> levels = levelMapper.toDTO(game.getLevels());
        return ResponseEntity.ok(LevelCriteria.filter(criteria, levels));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{levelId}")
    public ResponseEntity<LevelDTO> getLevel(@PathVariable String gameId, @PathVariable String levelId) {
        Game game = findGameByIdOrThrow(gameId);
        Level level = game.getLevels().stream().filter(l -> l.getName().equalsIgnoreCase(levelId)).toList().getFirst();
        return ResponseEntity.ok(levelMapper.toDTO(level));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<LevelDTO> upsertLevel(@PathVariable String gameId, @RequestBody LevelDTO levelDTO) {
        log.info("REST request to upsert level {} of game {}", levelDTO, gameId);
        Game game = gameService.upsertLevel(gameId, levelMapper.toEntity(levelDTO));
        Level level = game.getLevels().stream().filter(l -> l.getName().equalsIgnoreCase(levelDTO.getName())).toList().getFirst();
        return ResponseEntity.ok(levelMapper.toDTO(level));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{lvlName}")
    public ResponseEntity<LevelDTO> upsertLevel(@PathVariable String gameId, @PathVariable String lvlName) {
        gameService.deleteLevel(gameId, lvlName);
        return ResponseEntity.noContent().build();
    }

}
