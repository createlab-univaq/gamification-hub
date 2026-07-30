package it.createlab.gamificationhub.api.service.impl;

import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.core.ChallengeAssignment;
import eu.trentorise.game.services.PlayerService;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.exception.RequestException;
import it.createlab.gamificationhub.api.model.dto.ChallengeAssignmentDTO;
import it.createlab.gamificationhub.api.model.dto.ChallengeEditDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.ChallengeConceptDTO;
import it.createlab.gamificationhub.api.model.mapper.ChallengeAssignmentMapper;
import it.createlab.gamificationhub.api.model.mapper.ChallengeConceptMapper;
import it.createlab.gamificationhub.api.service.PlayerChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlayerChallengeServiceImpl implements PlayerChallengeService {

    private final PlayerService playerService;
    private final ChallengeConceptMapper challengeConceptMapper;
    private final ChallengeAssignmentMapper challengeAssignmentMapper;

    @Override
    public ChallengeConceptDTO assign(String gameId, String playerId, ChallengeAssignmentDTO assignment) {
        ChallengeAssignment challengeAssignment = challengeAssignmentMapper.toEntity(assignment);
        try {
            ChallengeConcept challenge = playerService.assignChallenge(gameId, playerId, challengeAssignment);
            log.info("Assigned challenge {} to player {} in game {}", challenge.getName(), playerId, gameId);
            return challengeConceptMapper.toDTO(challenge);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid challenge assignment", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public List<ChallengeConceptDTO> list(String gameId, String playerId) {
        PlayerState state = loadStateOrThrow(gameId, playerId);
        return state.challenges().stream()
                .map(challengeConceptMapper::toDTO)
                .toList();
    }

    @Override
    public ChallengeConceptDTO get(String gameId, String playerId, String instanceName) {
        PlayerState state = loadStateOrThrow(gameId, playerId);
        ChallengeConcept challenge = state.challenge(instanceName)
                .orElseThrow(() -> new EntityNotFoundException("Challenge", instanceName,
                        ErrorCodes.CHALLENGE_INSTANCE_NOT_FOUND));
        return challengeConceptMapper.toDTO(challenge);
    }

    @Override
    public ChallengeConceptDTO edit(String gameId, String playerId, String instanceName, ChallengeEditDTO edit) {
        Date start = edit.getStart() != null ? Date.from(edit.getStart()) : null;
        Date end = edit.getEnd() != null ? Date.from(edit.getEnd()) : null;
        ChallengeConcept challenge = playerService.editChallenge(gameId, playerId, instanceName, start, end,
                edit.getHide());
        if (challenge == null) {
            throw new EntityNotFoundException("Challenge", instanceName, ErrorCodes.CHALLENGE_INSTANCE_NOT_FOUND);
        }
        log.info("Edited challenge {} of player {} in game {}", instanceName, playerId, gameId);
        return challengeConceptMapper.toDTO(challenge);
    }

    @Override
    public ChallengeConceptDTO accept(String gameId, String playerId, String instanceName) {
        try {
            ChallengeConcept accepted = playerService.acceptChallenge(gameId, playerId, instanceName);
            log.info("Accepted challenge {} of player {} in game {}", instanceName, playerId, gameId);
            return challengeConceptMapper.toDTO(accepted);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid challenge acceptance", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ChallengeConceptDTO forceChoice(String gameId, String playerId) {
        try {
            ChallengeConcept chosen = playerService.forceChallengeChoice(gameId, playerId);
            log.info("Forced challenge choice for player {} in game {}", playerId, gameId);
            return challengeConceptMapper.toDTO(chosen);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid challenge choice", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public void delete(String gameId, String playerId, String instanceName) {
        ChallengeConcept deleted = playerService.deleteChallenge(gameId, playerId, instanceName);
        if (deleted == null) {
            throw new EntityNotFoundException("Challenge", instanceName, ErrorCodes.CHALLENGE_INSTANCE_NOT_FOUND);
        }
    }

    private PlayerState loadStateOrThrow(String gameId, String playerId) {
        PlayerState state = playerService.loadState(gameId, playerId, false, true);
        if (state == null) {
            throw new EntityNotFoundException("Player", playerId, ErrorCodes.PLAYER_NOT_FOUND);
        }
        return state;
    }

}
