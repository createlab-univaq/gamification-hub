package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.util.Map;

@Data
public class RewardDTO {

    private double percentage;

    private double threshold;

    private Map<String, Double> bonusScore;

    private String calculationPointConceptName;

    private String calculationPeriodName;

    private String targetPointConceptName;

    private String targetPeriodName;

}
