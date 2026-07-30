package it.createlab.gamificationhub.api.model.dto.simulation;

import lombok.Data;

@Data
public class ConceptChangeDTO {
    private String conceptType;
    private String conceptName;
    private String field;
    private Object before;
    private Object after;
}
