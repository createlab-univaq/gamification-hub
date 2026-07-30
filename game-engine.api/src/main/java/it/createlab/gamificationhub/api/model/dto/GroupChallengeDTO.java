package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class GroupChallengeDTO {

    private String id;

    private String gameId;

    private String instanceName;

    private String challengeModel;

    private double challengeTarget;

    private String state;

    private String origin;

    private Instant start;

    private Instant end;

    private int priority;

    private String pointConceptName;

    private String periodName;

    private List<AttendeeDTO> attendees;

    private RewardDTO reward;

}
