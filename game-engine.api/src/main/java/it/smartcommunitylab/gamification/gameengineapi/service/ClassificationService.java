package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.ClassificationCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationBoardDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClassificationService {

    List<ClassificationDTO> get(String gameId, ClassificationCriteria criteria);

    ClassificationDTO get(String gameId, String classificationId);

    ClassificationDTO create(ClassificationDTO classificationDTO);

    ClassificationDTO update(ClassificationDTO classificationDTO);

    void delete(String gameId, String classificationId);

    ClassificationBoardDTO getBoard(String gameId, String classificationId, long timestamp, int periodInstanceIndex,
            Pageable pageable);

}
