package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.dto.ChallengeInvitationDTO;
import it.createlab.gamificationhub.api.model.dto.GroupChallengeDTO;

import java.util.List;

public interface GroupChallengeService {

    GroupChallengeDTO invite(String gameId, String playerId, ChallengeInvitationDTO invitation);

    GroupChallengeDTO acceptInvitation(String gameId, String playerId, String challengeName);

    GroupChallengeDTO refuseInvitation(String gameId, String playerId, String challengeName);

    GroupChallengeDTO cancelInvitation(String gameId, String playerId, String challengeName);

    List<GroupChallengeDTO> list(String gameId, String playerId);

}
