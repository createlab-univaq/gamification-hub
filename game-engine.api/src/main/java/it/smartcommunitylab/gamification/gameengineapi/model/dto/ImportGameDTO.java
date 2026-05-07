package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.repo.GamePersistence;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ImportGameDTO {

    @NotNull
    private GamePersistence game;
    @NotNull
    private List<ChallengeDTO> challengeModels;
    @NotNull
    private List<RuleDTO> rules;

}
