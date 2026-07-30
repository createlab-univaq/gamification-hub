package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.services.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.createlab.gamificationhub.api.model.criteria.ScenarioCriteria;
import it.createlab.gamificationhub.api.model.dto.SimulationScenarioDTO;
import it.createlab.gamificationhub.api.model.mapper.GameMapper;
import it.createlab.gamificationhub.api.service.ScenarioService;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/scenarios")
@Slf4j
@Tag(name = "Scenarios", description = "Manage test scenarios of a game")
public class ScenarioController extends BaseGameController {

    private final ScenarioService scenarioService;

    public ScenarioController(GameService gameService, GameMapper gameMapper, ScenarioService scenarioService) {
        super(gameService, gameMapper);
        this.scenarioService = scenarioService;
    }

    @Operation(summary = "Get scenarios", description = "List all of the scenarios of a game filtered by the given criteria")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<SimulationScenarioDTO>> getScenarios(@PathVariable String gameId, @ParameterObject ScenarioCriteria criteria) {
        log.info("Get scenarios for game={} by criteria={}", gameId, criteria);
        findGameByIdOrThrow(gameId);
        criteria.setGameId(gameId);
        return ResponseEntity.ok(scenarioService.get(criteria));
    }

    @Operation(summary = "Get scenario", description = "Retrieve a particular scenario")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{scenarioId}")
    public ResponseEntity<SimulationScenarioDTO> getScenario(@PathVariable String gameId, @PathVariable String scenarioId) {
        log.info("Get scenario={} for game={}", scenarioId, gameId);
        findGameByIdOrThrow(gameId);
        return ResponseEntity.ok(scenarioService.get(scenarioId));
    }

    @Operation(summary = "Create scenario", description = "Save a new game scenario")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<SimulationScenarioDTO> createScenario(@PathVariable String gameId, @RequestBody SimulationScenarioDTO scenarioDTO) {
        log.info("Create scenario={} for game={}", scenarioDTO.getName(), gameId);
        findGameByIdOrThrow(gameId);
        scenarioDTO.setId(null);
        scenarioDTO.setGameId(gameId);
        return ResponseEntity.status(HttpStatus.CREATED).body(scenarioService.create(scenarioDTO));
    }

    @Operation(summary = "Edit scenario", description = "Update an existing scenario")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{scenarioId}")
    public ResponseEntity<SimulationScenarioDTO> updateScenario(@PathVariable String gameId, @PathVariable String scenarioId, @RequestBody SimulationScenarioDTO scenarioDTO) {
        log.info("Update scenario={} for game={}", scenarioId, gameId);
        findGameByIdOrThrow(gameId);
        scenarioDTO.setId(scenarioId);
        scenarioDTO.setGameId(gameId);
        return ResponseEntity.ok(scenarioService.update(scenarioDTO));
    }

    @Operation(summary = "Delete scenario", description = "Remove a scenario permanently")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{scenarioId}")
    public ResponseEntity<Void> deleteScenario(@PathVariable String gameId, @PathVariable String scenarioId) {
        log.info("Delete scenario={} for game={}", scenarioId, gameId);
        scenarioService.delete(scenarioId);
        return ResponseEntity.noContent().build();
    }

}
