package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationResultDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.SimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/simulate")
@Slf4j
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping
    public ResponseEntity<SimulationResultDTO> simulate(@RequestBody @Valid SimulationRequestDTO request) {
        log.info("Simulate game={} player={}", request.getGameId(), request.getSyntheticState().getPlayerId());
        return ResponseEntity.ok(simulationService.simulate(request));
    }

}
