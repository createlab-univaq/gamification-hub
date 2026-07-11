package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class AttendeeDTO {

    private String playerId;

    private String role;

    private double challengeScore;

    private Instant valuationTime;

}
