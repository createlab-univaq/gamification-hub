package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ChallengeInvitationDTO {

    private String gameId;

    private String proposerId;

    private List<String> guestIds;

    private String challengeName;

    private String challengeModelName;

    private Instant challengeStart;

    private Instant challengeEnd;

    private double challengeTarget;

    private String pointConceptName;

    private String periodName;

    private RewardDTO reward;

}
