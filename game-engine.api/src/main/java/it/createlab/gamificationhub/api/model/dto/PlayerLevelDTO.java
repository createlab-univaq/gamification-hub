package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

@Data
public class PlayerLevelDTO {

    private String levelName;

    private String levelValue;

    private int levelIndex;

    private String pointConcept;

    private double startLevelScore;

    private double endLevelScore;

    private double toNextLevel;

}
