package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class AttendeeDTO {

    private String playerId;

    private String role;

    private double challengeScore;

    private Instant valuationTime;

}
