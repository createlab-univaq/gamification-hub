package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ChallengeEditDTO {

    private Instant start;

    private Instant end;

    private Boolean hide;

}
