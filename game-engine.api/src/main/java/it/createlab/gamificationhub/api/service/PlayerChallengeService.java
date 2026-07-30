package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.dto.ChallengeAssignmentDTO;
import it.createlab.gamificationhub.api.model.dto.ChallengeEditDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.ChallengeConceptDTO;

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
