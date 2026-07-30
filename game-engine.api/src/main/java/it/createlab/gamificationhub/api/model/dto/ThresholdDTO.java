package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

@Data
public class ThresholdDTO {

    private String name;

    private double value;

    private int index;

    private ThresholdConfigDTO config;

}
