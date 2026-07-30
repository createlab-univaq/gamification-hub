package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ThresholdConfigDTO {

    private int choices;

    private List<String> availableModels = new ArrayList<>();

    private List<String> activeModels = new ArrayList<>();

}
