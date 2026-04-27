package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.simulation.SimulationResult;
import eu.trentorise.game.services.Workflow;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.*;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.SimulationResultMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.SimulationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
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

        if (dto.getChallenges() != null) {
            for (ChallengeConceptDTO cc : dto.getChallenges()) {
                ChallengeConcept challenge = new ChallengeConcept();
                challenge.setName(cc.getName());
                challenge.setModelName(cc.getModelName());
                if (cc.getState() != null) {
                    challenge.setState(ChallengeConcept.ChallengeState.valueOf(cc.getState()));
                }
                if (cc.getFields() != null) {
                    challenge.setFields(cc.getFields());
                }
                if (cc.getStart() != null) {
                    challenge.setStart(new Date(String.valueOf(cc.getStart())));
                }
                if (cc.getEnd() != null) {
                    challenge.setEnd(new Date(String.valueOf(cc.getEnd())));
                }
                state.getState().add(challenge);
            }
        }

        if (dto.getCustomData() != null) {
            state.getCustomData().putAll(dto.getCustomData());
        }

        return state;
    }

    @Override
    public SimulationResultDTO simulate(SimulationRequestDTO simulationRequestDTO) {
        log.info("Request to simulate game={}", simulationRequestDTO.getGameId());
        try {
            long executionMoment = Objects.requireNonNullElse(simulationRequestDTO.getExecutionMoment(), Instant.now().toEpochMilli());
            PlayerState syntheticState = buildSyntheticState(simulationRequestDTO.getGameId(), simulationRequestDTO.getSyntheticState());
            SimulationResult result = workflow.simulate(
                    simulationRequestDTO.getGameId(), syntheticState,
                    simulationRequestDTO.getData(), executionMoment,
                    simulationRequestDTO.getSyntheticState().getActionIds(),
                    simulationRequestDTO.isShowDetailedChanges());
            return simulationResultMapper.toDTO(result);
        } catch (Exception e) {
            throw new RequestException("Rule Simulation Error", e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

}
