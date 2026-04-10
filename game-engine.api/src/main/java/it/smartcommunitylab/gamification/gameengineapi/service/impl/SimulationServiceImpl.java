package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.simulation.SimulationResult;
import eu.trentorise.game.services.Workflow;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.*;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.SimulationResultMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.SimulationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class SimulationServiceImpl implements SimulationService {

    private final Workflow workflow;

    private final SimulationResultMapper simulationResultMapper;

    private PlayerState buildSyntheticState(String gameId, SyntheticStateDTO dto) {
        if (Objects.isNull(dto) || Objects.isNull(gameId) || gameId.isBlank()) {
            return null;
        }
        PlayerState state = new PlayerState(gameId,
                dto.getPlayerId() != null ? dto.getPlayerId() : "synthetic-player");
        state.setState(new HashSet<>());
        if (dto.getPointConcepts() != null) {
            for (PointConceptDTO pc : dto.getPointConcepts()) {
                PointConcept pointConcept = new PointConcept(pc.getName());
                pointConcept.setScore(pc.getScore());
                state.getState().add(pointConcept);
            }
        }

        if (dto.getBadgeCollections() != null) {
            for (BadgeCollectionDTO bc : dto.getBadgeCollections()) {
                BadgeCollectionConcept bcc = new BadgeCollectionConcept(bc.getName());
                if (bc.getBadges() != null) {
                    bcc.getBadgeEarned().addAll(bc.getBadges());
                }
                state.getState().add(bcc);
            }
        }

        return state;
    }

    @Override
    public SimulationResultDTO simulate(String gameId, String actionId, SimulationRequestDTO simulationRequestDTO) {
        log.info("Request to simulate game={}, and action={}", gameId, actionId);
        long executionMoment = Objects.requireNonNullElse(simulationRequestDTO.getExecutionMoment(), Instant.now().toEpochMilli());
        PlayerState syntheticState = buildSyntheticState(gameId, simulationRequestDTO.getSyntheticState());
        SimulationResult result = workflow.simulate(
                gameId, actionId, simulationRequestDTO.getPlayerId(),
                executionMoment, simulationRequestDTO.getData(), syntheticState,
                simulationRequestDTO.isShowDetailedChanges());
        return simulationResultMapper.toDTO(result);
    }

}
