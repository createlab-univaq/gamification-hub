package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SimulationRequestDTO {

    @NotBlank
    private String gameId;

    @NotBlank
    private String actionId;

    private String playerId;

    @NotNull
    private SyntheticStateDTO syntheticState;

    private Map<String, Object> data;

    private Long executionMoment;

    // When true, each fired rule includes the concepts it changed and the rule that caused it.
    // Adds per-rule snapshot overhead — use only for debugging/analysis, not production calls.
    private boolean showDetailedChanges = false;

}
