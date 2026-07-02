package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.services.GameService;
import eu.trentorise.game.services.PlayerService;
import eu.trentorise.game.services.Workflow;
import it.smartcommunitylab.gamification.gameengineapi.controller.v1.games.BaseGameController;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ExecutionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationResultDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.SimulationService;
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
@Slf4j
public class ExecutionController extends BaseGameController {

    private final PlayerService playerService;
    private final Workflow workflow;
    private final SimulationService simulationService;

    public ExecutionController(GameService gameService, GameMapper gameMapper, PlayerService playerService, Workflow workflow, SimulationService simulationService) {
        super(gameService, gameMapper);
        this.playerService = playerService;
        this.workflow = workflow;
        this.simulationService = simulationService;
    }

    @PostMapping
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#executionDTO.gameId)")
    public ResponseEntity<PlayerState> executeGame(@RequestBody @Valid ExecutionDTO executionDTO) {
        log.info("REST request to execute game action {}", executionDTO);
        Game game = findGameByIdOrThrow(executionDTO.getGameId());
        if (!game.getActions().contains(executionDTO.getActionId())) {
            throw new EntityNotFoundException("Action", executionDTO.getActionId(), ErrorCodes.ACTION_NOT_FOUND);
        }
        try {
            workflow.apply(executionDTO.getGameId(),
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
            return ResponseEntity.ok(state);
        } catch (Exception e) {
            log.error("Game execution interrupted by unexpected error {}", e.getLocalizedMessage());
            throw new RequestException("Game execution failed", "Could not advance game state due to an error", ErrorCodes.GAME_EXECUTION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/simulations")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#request.gameId)")
    public ResponseEntity<SimulationResultDTO> simulate(@RequestBody @Valid SimulationRequestDTO request) {
        log.info("Simulate game={} player={}", request.getGameId(), request.getSyntheticState().getPlayerId());
        return ResponseEntity.ok(simulationService.simulate(request));
    }

}
