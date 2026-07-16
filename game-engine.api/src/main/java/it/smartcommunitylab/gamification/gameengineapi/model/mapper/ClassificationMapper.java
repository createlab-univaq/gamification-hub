package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.core.ClassificationPosition;
import eu.trentorise.game.task.ClassificationTask;
import eu.trentorise.game.task.GeneralClassificationTask;
import eu.trentorise.game.task.IncrementalClassificationTask;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationBoardDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationPositionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationType;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.ArrayList;
import java.util.List;

@Mapper(config = EntityMapper.class)
public interface ClassificationMapper {

    default ClassificationDTO toDTO(ClassificationTask task) {
        ClassificationDTO dto = new ClassificationDTO();
        dto.setId(task.getName());
        dto.setName(task.getName());
        dto.setItemsToNotificate(task.getItemsToNotificate());
        dto.setType(typeOf(task));
        switch (task) {
            case IncrementalClassificationTask incrementalTask -> {
                dto.setPointConceptName(incrementalTask.getPointConceptName());
                dto.setPeriodName(incrementalTask.getPeriodName());
            }
            case GeneralClassificationTask generalTask -> {
                dto.setPointConceptName(generalTask.getItemType());
                if (generalTask.getSchedule() != null) {
                    dto.setCronExpression(generalTask.getSchedule().getCronExpression());
                }
            }
            default -> {
            }
        }
        return dto;
    }

    default ClassificationBoardDTO toBoardDTO(ClassificationTask task, Page<ClassificationPosition> board) {
        ClassificationBoardDTO boardDTO = new ClassificationBoardDTO();
        boardDTO.setClassificationName(task.getName());
        boardDTO.setType(typeOf(task));
        boardDTO.setPointConceptName(pointConceptNameOf(task));
        if (board != null) {
            long offset = board.getPageable().isPaged() ? board.getPageable().getOffset() : 0;
            List<ClassificationPositionDTO> positions = new ArrayList<>();
            for (int i = 0; i < board.getContent().size(); i++) {
                ClassificationPosition position = board.getContent().get(i);
                positions.add(new ClassificationPositionDTO((int) (offset + i + 1),
                        position.getPlayerId(), position.getScore(), position.isTeam()));
            }
            boardDTO.setBoard(new PageImpl<>(positions, board.getPageable(), board.getTotalElements()));
        }
        return boardDTO;
    }

    default String pointConceptNameOf(ClassificationTask task) {
        if (task instanceof IncrementalClassificationTask incrementalTask) {
            return incrementalTask.getPointConceptName();
        }
        if (task instanceof GeneralClassificationTask generalTask) {
            return generalTask.getItemType();
        }
        return null;
    }

    default ClassificationType typeOf(ClassificationTask task) {
        return task instanceof IncrementalClassificationTask ? ClassificationType.INCREMENTAL
                : ClassificationType.GENERAL;
    }

}
