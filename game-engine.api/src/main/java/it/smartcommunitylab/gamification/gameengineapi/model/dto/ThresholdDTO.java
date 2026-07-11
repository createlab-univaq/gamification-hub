package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

@Data
public class ThresholdDTO {

    private String name;

    private double value;

    private int index;

    private ThresholdConfigDTO config;

}
