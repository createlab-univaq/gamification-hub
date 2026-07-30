package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.criteria.ClassificationCriteria;
import it.createlab.gamificationhub.api.model.dto.ClassificationBoardDTO;
import it.createlab.gamificationhub.api.model.dto.ClassificationDTO;
import it.createlab.gamificationhub.api.model.dto.ClassificationScope;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClassificationService {

    List<ClassificationDTO> get(String gameId, ClassificationCriteria criteria);

    ClassificationDTO get(String gameId, String classificationId);

    ClassificationDTO create(ClassificationDTO classificationDTO);

    ClassificationDTO update(ClassificationDTO classificationDTO);

    void delete(String gameId, String classificationId);

    ClassificationBoardDTO getBoard(String gameId, String classificationId, long timestamp, int periodInstanceIndex,
            ClassificationScope scope, Pageable pageable);

}
