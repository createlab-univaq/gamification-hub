package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class InventoryDTO {

    private List<ChallengeChoiceDTO> challengeChoices;

    private int challengeActivationActions;

}
