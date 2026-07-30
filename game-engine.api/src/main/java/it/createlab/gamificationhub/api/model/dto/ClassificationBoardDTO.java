package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;
import org.springframework.data.domain.Page;

@Data
public class ClassificationBoardDTO {

    private String classificationName;

    private String pointConceptName;

    private ClassificationType type;

    private Page<ClassificationPositionDTO> board;

}
