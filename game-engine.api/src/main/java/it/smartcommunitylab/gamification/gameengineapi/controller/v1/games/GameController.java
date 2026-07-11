package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.managers.RuleImpactAnalyzer;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.impact.GameImpactResult;
import eu.trentorise.game.services.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.smartcommunitylab.gamification.gameengineapi.config.security.DomainUserDetails;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.GameCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GameDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GamePersistanceDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ImportGameDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.impact.RuleImpactDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.RuleImpactMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.ImportService;
import it.smartcommunitylab.gamification.gameengineapi.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games")
@Tag(name = "Games", description = "Create, configure, import/export and analyze games")
@Slf4j
public class GameController extends BaseGameController {

    private final ImportService importService;

    private final RuleImpactAnalyzer ruleImpactAnalyzer;

    private final RuleImpactMapper ruleImpactMapper;

    public GameController(GameService gameService, GameMapper gameMapper, ImportService importService, RuleImpactAnalyzer ruleImpactAnalyzer, RuleImpactMapper ruleImpactMapper) {
        super(gameService, gameMapper);
        this.importService = importService;
        this.ruleImpactAnalyzer = ruleImpactAnalyzer;
        this.ruleImpactMapper = ruleImpactMapper;
    }

    @Operation(summary = "Analyze rule impact", description = "Runs static impact analysis over the game's rules and returns their inferred relationships.")
    @GetMapping("/{gameId}/impact")
    public ResponseEntity<List<RuleImpactDTO>> analyzeGame(@PathVariable String gameId) {
        log.info("Impact analysis requested for game={}", gameId);
        GameImpactResult result = ruleImpactAnalyzer.analyze(gameId);
        List<RuleImpactDTO> dtos = result.getRules().entrySet().stream()
                .map(entry -> ruleImpactMapper.toDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @Operation(summary = "Create a game", description = "Creates a new game owned by the current user. The payload must not carry an id.")
    @PostMapping
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO gameDTO) {
        log.info("Create game name={}", gameDTO.getName());
        if (!Objects.isNull(gameDTO.getId())) {
            throw new EntityCreationException("Game", "A new game cannot already have an ID", ErrorCodes.GAME_CREATION);
        }
        DomainUserDetails user = SecurityUtils.getCurrentUser();
        if (Objects.isNull(user)) {
            throw new UsernameNotFoundException("Cannot create game if user is not authenticated");
        }
        gameDTO.setOwner(user.getId());
        Game game = gameMapper.toEntity(gameDTO);
        Game saved = gameService.saveGameDefinition(game);
        return ResponseEntity.status(HttpStatus.CREATED).body(gameMapper.toDTO(saved));
    }

    @Operation(summary = "Import games", description = "Bulk-imports one or more full game definitions.")
    @PostMapping("/import")
    public ResponseEntity<List<GamePersistanceDTO>> importGames(@RequestBody @Valid List<ImportGameDTO> games) {
        log.info("Import {} games", games.size());
        if (games.isEmpty()) {
            throw new RequestException("Import Error", "There should be at least 1 game", ErrorCodes.IMPORT_EMPTY, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(importService.importGames(games));
    }

    @Operation(summary = "Export a game", description = "Exports a single game's full definition by id.")
    @GetMapping("/{gameId}/export")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<ImportGameDTO> exportGame(@PathVariable String gameId) {
        log.info("Export game={}", gameId);
        return ResponseEntity.ok(importService.exportGame(gameId));
    }

    @Operation(summary = "Export games", description = "Exports the full definitions of the given game ids.")
    @PostMapping("/export")
    public ResponseEntity<List<ImportGameDTO>> exportGames(@RequestBody List<String> ids) {
        log.info("Export {} games", ids.size());
        return ResponseEntity.ok(importService.exportGames(ids));
    }

    @Operation(summary = "Get a game", description = "Returns a single game definition by id.")
    @GetMapping("/{gameId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<GameDTO> getGame(@PathVariable String gameId) {
        log.info("Get game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        log.info("Terminated {}, {}", game.isTerminated(), gameMapper.toDTO(game).isTerminated());
        return ResponseEntity.ok(gameMapper.toDTO(game));
    }

    @Operation(summary = "List games", description = "Lists the games owned by the current user, filtered by the given criteria.")
    @GetMapping
    public ResponseEntity<List<GameDTO>> getGames(@ParameterObject GameCriteria criteria) {
        log.info("Get all games by criteria: {}", criteria);
        DomainUserDetails userDetails = SecurityUtils.getCurrentUser();
        List<GameDTO> games = gameService.loadGameByOwner(userDetails.getId()).stream()
                .map(gameMapper::toDTO)
                .collect(Collectors.toList());
        games = GameCriteria.filter(criteria, games);
        return ResponseEntity.ok(games);
    }

    @Operation(summary = "Update a game", description = "Updates a game's metadata (name, domain, expiration, terminated). Actions, rules, tasks and concepts are managed through their own endpoints and are left untouched here.")
    @PutMapping("/{gameId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<GameDTO> updateGame(@PathVariable String gameId, @RequestBody GameDTO gameDTO) {
        log.info("Update game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        gameDTO.setId(gameId);
        gameMapper.updateEntity(game, gameDTO);
        Game saved = gameService.saveGameDefinition(game);
        return ResponseEntity.ok(gameMapper.toDTO(saved));
    }

    @Operation(summary = "Delete a game", description = "Permanently deletes a game and its definition.")
    @DeleteMapping("/{gameId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<Void> deleteGame(@PathVariable String gameId) {
        log.info("Delete game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        gameService.deleteGame(game.getId());
        return ResponseEntity.noContent().build();
    }


}
