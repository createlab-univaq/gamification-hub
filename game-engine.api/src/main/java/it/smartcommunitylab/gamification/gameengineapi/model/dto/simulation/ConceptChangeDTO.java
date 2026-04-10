package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import lombok.Data;

@Data
public class ConceptChangeDTO {
    private String conceptType;
    private String conceptName;
    private String field;
    private Object before;
    private Object after;
}
