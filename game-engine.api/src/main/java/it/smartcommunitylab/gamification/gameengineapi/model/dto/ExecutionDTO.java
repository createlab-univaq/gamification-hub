package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ExecutionDTO implements Serializable {

    @NotBlank
    private String gameId;

    @NotBlank
    private String actionId;

    @NotBlank
    private String playerId;

    @NotNull
    private Map<String, Object> data;

    private List<Object> customData;

    private Instant executionMoment = Instant.now();

}
