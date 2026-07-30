package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class InventoryDTO {

    private List<ChallengeChoiceDTO> challengeChoices;

    private int challengeActivationActions;

}
