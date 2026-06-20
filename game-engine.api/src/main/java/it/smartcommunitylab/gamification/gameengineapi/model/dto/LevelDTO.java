package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import eu.trentorise.game.model.Level;
import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class LevelDTO {

    private String name;

    private String pointConceptName;

    private List<Level.Threshold> thresholds = new ArrayList<>();

}
