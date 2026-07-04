package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.core.ClassificationBoard;
import eu.trentorise.game.task.ClassificationTask;
import eu.trentorise.game.task.GeneralClassificationTask;
import eu.trentorise.game.task.IncrementalClassificationTask;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationBoardDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationPositionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationType;
import org.mapstruct.Mapper;

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

    default ClassificationBoardDTO toBoardDTO(ClassificationTask task, ClassificationBoard board) {
        ClassificationBoardDTO boardDTO = new ClassificationBoardDTO();
        boardDTO.setClassificationName(task.getName());
        boardDTO.setType(typeOf(task));
        if (board != null) {
            boardDTO.setPointConceptName(board.getPointConceptName());
            List<ClassificationPositionDTO> positions = new ArrayList<>();
            if (board.getBoard() != null) {
                for (int i = 0; i < board.getBoard().size(); i++) {
                    positions.add(new ClassificationPositionDTO(i + 1,
                            board.getBoard().get(i).getPlayerId(), board.getBoard().get(i).getScore()));
                }
            }
            boardDTO.setBoard(positions);
        }
        return boardDTO;
    }

    default ClassificationType typeOf(ClassificationTask task) {
        return task instanceof IncrementalClassificationTask ? ClassificationType.INCREMENTAL
                : ClassificationType.GENERAL;
    }

}
