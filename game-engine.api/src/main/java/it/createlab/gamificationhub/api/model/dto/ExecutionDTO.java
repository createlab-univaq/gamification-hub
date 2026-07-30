package it.createlab.gamificationhub.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    private Instant executionMoment;

    public Instant getExecutionMoment() {
        return executionMoment != null ? executionMoment : Instant.now();
    }

}
