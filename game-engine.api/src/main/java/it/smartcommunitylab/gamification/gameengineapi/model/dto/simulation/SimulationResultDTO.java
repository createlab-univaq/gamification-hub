package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SimulationResultDTO {
    private PlayerStateDTO initialState;
    private PlayerStateDTO finalState;
    private List<FiredRuleDTO> firedRules;
    private List<ConceptChangeDTO> changes;
}
