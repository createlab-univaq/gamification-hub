package it.createlab.gamificationhub.api.controller.v1;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.services.GameService;
import eu.trentorise.game.services.PlayerService;
import eu.trentorise.game.services.Workflow;
import it.createlab.gamificationhub.api.controller.v1.games.BaseGameController;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.exception.RequestException;
import it.createlab.gamificationhub.api.model.dto.ExecutionDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.PlayerStateDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.SimulationRequestDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.SimulationResultDTO;
import it.createlab.gamificationhub.api.model.mapper.GameMapper;
import it.createlab.gamificationhub.api.model.mapper.PlayerStateMapper;
import it.createlab.gamificationhub.api.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/executions")
@Tag(name = "Execution", description = "Execute game actions and run simulations")
@Slf4j
public class ExecutionController extends BaseGameController {

    private final PlayerService playerService;
    private final Workflow workflow;
    private final SimulationService simulationService;
    private final PlayerStateMapper playerStateMapper;

    public ExecutionController(GameService gameService, GameMapper gameMapper, PlayerService playerService, Workflow workflow, SimulationService simulationService, PlayerStateMapper playerStateMapper) {
        super(gameService, gameMapper);
        this.playerService = playerService;
        this.workflow = workflow;
        this.simulationService = simulationService;
        this.playerStateMapper = playerStateMapper;
    }

    @Operation(summary = "Execute a game action", description = "Applies an action for a player and returns the updated player state. Runs synchronously.")
    @PostMapping
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#executionDTO.gameId)")
    public ResponseEntity<PlayerStateDTO> executeGame(@RequestBody @Valid ExecutionDTO executionDTO) {
        log.info("REST request to execute game action {}", executionDTO);
        Game game = findGameByIdOrThrow(executionDTO.getGameId());
        if (!game.getActions().contains(executionDTO.getActionId())) {
            throw new EntityNotFoundException("Action", executionDTO.getActionId(), ErrorCodes.ACTION_NOT_FOUND);
        }
        try {
            workflow.applySync(executionDTO.getGameId(),
                    executionDTO.getActionId(),
                    executionDTO.getPlayerId(),
                    executionDTO.getExecutionMoment().toEpochMilli(),
                    executionDTO.getData(),
                    executionDTO.getCustomData()
            );
            log.info("Game executed successfully");
            PlayerState state = playerService.loadState(executionDTO.getGameId(),
                    executionDTO.getPlayerId(),
                    false,
                    false
            );
            return ResponseEntity.ok(playerStateMapper.toDTO(state));
        } catch (Exception e) {
            log.error("Game execution interrupted by unexpected error {}", e.getLocalizedMessage());
            throw new RequestException("Game execution failed", "Could not advance game state due to an error", ErrorCodes.GAME_EXECUTION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Simulate", description = "Runs a simulation against a synthetic player state without persisting anything.")
    @PostMapping("/simulations")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#request.gameId)")
    public ResponseEntity<SimulationResultDTO> simulate(@RequestBody @Valid SimulationRequestDTO request) {
        log.info("Simulate game={} player={}", request.getGameId(), request.getSyntheticState().getPlayerId());
        return ResponseEntity.ok(simulationService.simulate(request));
    }

}
