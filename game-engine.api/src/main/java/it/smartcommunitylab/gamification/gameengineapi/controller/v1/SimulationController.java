package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.model.simulation.ConceptChange;
import eu.trentorise.game.model.simulation.FiredRuleResult;
import eu.trentorise.game.model.simulation.SimulationResult;
import eu.trentorise.game.services.Workflow;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.BadgeCollectionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ConceptChangeDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.FiredRuleDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PlayerStateDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PointConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SimulationResultDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.SimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/simulate")
@Slf4j
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping
    public ResponseEntity<SimulationResultDTO> simulate(@RequestBody @Valid SimulationRequestDTO request) {
        log.info("Simulate action={} game={} player={}", request.getActionId(), request.getGameId(), request.getPlayerId());
        return ResponseEntity.ok(simulationService.simulate(request.getActionId(), request.getGameId(), request));
    }

}
