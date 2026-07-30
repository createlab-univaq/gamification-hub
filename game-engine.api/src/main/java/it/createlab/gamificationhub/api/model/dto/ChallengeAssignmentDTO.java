package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
public class ChallengeAssignmentDTO {

    private String modelName;

    private String instanceName;

    private Map<String, Object> data;

    private String challengeType;

    private String origin;

    private Instant start;

    private Instant end;

    private int priority;

    private boolean hide;

}
