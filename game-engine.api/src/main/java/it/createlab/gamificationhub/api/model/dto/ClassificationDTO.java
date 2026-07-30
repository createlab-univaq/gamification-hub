package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

@Data
public class ClassificationDTO {

    private String id;

    private String gameId;

    private String name;

    private ClassificationType type;

    private String pointConceptName;

    private Integer itemsToNotificate;

    private String cronExpression;

    private String periodName;

}
