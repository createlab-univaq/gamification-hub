package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeAssignmentDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeEditDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;

import java.util.List;

public interface PlayerChallengeService {

    ChallengeConceptDTO assign(String gameId, String playerId, ChallengeAssignmentDTO assignment);

    List<ChallengeConceptDTO> list(String gameId, String playerId);

    ChallengeConceptDTO get(String gameId, String playerId, String instanceName);

    ChallengeConceptDTO edit(String gameId, String playerId, String instanceName, ChallengeEditDTO edit);

    ChallengeConceptDTO accept(String gameId, String playerId, String instanceName);

    ChallengeConceptDTO forceChoice(String gameId, String playerId);

    void delete(String gameId, String playerId, String instanceName);

}
