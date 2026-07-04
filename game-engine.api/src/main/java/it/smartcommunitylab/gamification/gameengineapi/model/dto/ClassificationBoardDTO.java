package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ClassificationBoardDTO {

    private String classificationName;

    private String pointConceptName;

    private ClassificationType type;

    private List<ClassificationPositionDTO> board = new ArrayList<>();

}
