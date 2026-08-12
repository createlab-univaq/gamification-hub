package it.createlab.gamificationhub.api.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ImportGameDTO {

    @NotNull
    private GamePersistanceDTO game;
    @NotNull
    private List<ChallengeDTO> challengeModels;
    @NotNull
    private List<RuleDTO> rules;

    private List<SimulationScenarioDTO> scenarios;

}
