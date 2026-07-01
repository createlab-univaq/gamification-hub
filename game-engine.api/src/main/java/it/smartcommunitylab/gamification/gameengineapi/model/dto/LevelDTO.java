package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class LevelDTO {

    private String name;

    private String pointConceptName;

    private List<ThresholdDTO> thresholds = new ArrayList<>();

}
