package it.createlab.gamificationhub.api.model.dto.simulation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class SimulationRequestDTO {

    @NotBlank
    private String gameId;

    @NotNull
    @Valid
    private SyntheticStateDTO syntheticState;

    private Map<String, Object> data;

    private Long executionMoment;

    // When true, each fired rule includes the concepts it changed and the rule that caused it.
    // Adds per-rule snapshot overhead — use only for debugging/analysis, not production calls.
    private boolean showDetailedChanges = false;

}
