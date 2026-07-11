package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.managers.ChallengeManager;
import eu.trentorise.game.model.ChallengeInvitation;
import eu.trentorise.game.model.GroupChallenge;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeInvitationDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GroupChallengeDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeInvitationMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GroupChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.GroupChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GroupChallengeServiceImpl implements GroupChallengeService {

    private final ChallengeManager challengeManager;
    private final GroupChallengeMapper groupChallengeMapper;
    private final ChallengeInvitationMapper challengeInvitationMapper;

    @Override
    public GroupChallengeDTO invite(String gameId, String playerId, ChallengeInvitationDTO invitation) {
        invitation.setGameId(gameId);
        invitation.setProposerId(playerId);
        ChallengeInvitation challengeInvitation = challengeInvitationMapper.toEntity(invitation);
        try {
            GroupChallenge pending = challengeManager.inviteToChallenge(challengeInvitation);
            log.info("Created group challenge invitation {} in game {}", pending.getInstanceName(), gameId);
            return groupChallengeMapper.toDTO(pending);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid challenge invitation", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public GroupChallengeDTO acceptInvitation(String gameId, String playerId, String challengeName) {
        try {
            GroupChallenge accepted = challengeManager.acceptInvitation(gameId, playerId, challengeName);
            log.info("Player {} accepted group challenge {} in game {}", playerId, challengeName, gameId);
            return toResponse(accepted, challengeName);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid invitation accept", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public GroupChallengeDTO refuseInvitation(String gameId, String playerId, String challengeName) {
        try {
            GroupChallenge refused = challengeManager.refuseInvitation(gameId, playerId, challengeName);
            log.info("Player {} refused group challenge {} in game {}", playerId, challengeName, gameId);
            return toResponse(refused, challengeName);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid invitation refuse", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public GroupChallengeDTO cancelInvitation(String gameId, String playerId, String challengeName) {
        try {
            GroupChallenge canceled = challengeManager.cancelInvitation(gameId, playerId, challengeName);
            log.info("Player {} canceled group challenge {} in game {}", playerId, challengeName, gameId);
            return toResponse(canceled, challengeName);
        } catch (IllegalArgumentException e) {
            throw new RequestException("Invalid invitation cancel", e.getMessage(),
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public List<GroupChallengeDTO> list(String gameId, String playerId) {
        return challengeManager.playerGroupChallenges(gameId, playerId).stream()
                .map(groupChallengeMapper::toDTO)
                .toList();
    }

    private GroupChallengeDTO toResponse(GroupChallenge result, String challengeName) {
        if (result == null) {
            throw new EntityNotFoundException("GroupChallenge", challengeName,
                    ErrorCodes.CHALLENGE_INSTANCE_NOT_FOUND);
        }
        return groupChallengeMapper.toDTO(result);
    }

}
