package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

@Data
public class ChallengeConceptDTO {
    private String name;
    private String modelName;
    private String state;
    private Map<String, Object> fields;
    private LocalDate start;
    private LocalDate end;
}
