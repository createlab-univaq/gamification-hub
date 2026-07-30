package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.core.Notification;
import eu.trentorise.game.notification.BadgeNotification;
import eu.trentorise.game.notification.ChallengeAssignedNotification;
import eu.trentorise.game.notification.ChallengeCompletedNotication;
import eu.trentorise.game.notification.ChallengeFailedNotication;
import eu.trentorise.game.notification.ChallengeInvitationAcceptedNotification;
import eu.trentorise.game.notification.ChallengeInvitationCanceledNotification;
import eu.trentorise.game.notification.ChallengeInvitationNotification;
import eu.trentorise.game.notification.ChallengeInvitationRefusedNotification;
import eu.trentorise.game.notification.ChallengeProposedNotification;
import eu.trentorise.game.notification.ClassificationNotification;
import eu.trentorise.game.notification.GameNotification;
import eu.trentorise.game.notification.LevelGainedNotification;
import eu.trentorise.game.notification.MessageNotification;
import it.createlab.gamificationhub.api.model.dto.NotificationDTO;
import org.mapstruct.Mapper;

import java.util.Date;
import java.util.List;

@Mapper(config = EntityMapper.class)
public abstract class NotificationMapper {

    public NotificationDTO toDTO(Notification notification) {
        if (notification == null) {
            return null;
        }
        NotificationDTO dto = new NotificationDTO();
        dto.setType(notification.getType());
        dto.setGameId(notification.getGameId());
        dto.setPlayerId(notification.getPlayerId());
        dto.setTimestamp(notification.getTimestamp());

        switch (notification) {
            case GameNotification n -> {
                dto.setActionId(n.getActionId());
                dto.setDataPayLoad(n.getDataPayLoad());
                dto.setScoreMap(n.getScoreMap());
                dto.setDeltaMap(n.getDeltaMap());
            }
            case BadgeNotification n -> {
                dto.setBadge(n.getBadge());
                dto.setCollectionName(n.getCollectionName());
            }
            case LevelGainedNotification n -> {
                dto.setLevelName(n.getLevelName());
                dto.setLevelType(n.getLevelType());
                dto.setLevelIndex(n.getLevelIndex());
            }
            case ClassificationNotification n -> {
                dto.setClassificationName(n.getClassificationName());
                dto.setClassificationPosition(n.getClassificationPosition());
            }
            case MessageNotification n -> {
                dto.setKey(n.getKey());
                dto.setData(n.getData());
            }
            case ChallengeAssignedNotification n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setStart(toMillis(n.getStartDate()));
                dto.setEnd(toMillis(n.getEndDate()));
            }
            case ChallengeProposedNotification n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setStart(toMillis(n.getStartDate()));
                dto.setEnd(toMillis(n.getEndDate()));
            }
            case ChallengeCompletedNotication n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setModel(n.getModel());
                dto.setPointConcept(n.getPointConcept());
                dto.setStart(n.getStart());
                dto.setEnd(n.getEnd());
            }
            case ChallengeFailedNotication n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setModel(n.getModel());
                dto.setPointConcept(n.getPointConcept());
                dto.setStart(n.getStart());
                dto.setEnd(n.getEnd());
            }
            case ChallengeInvitationAcceptedNotification n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setGuestId(n.getGuestId());
            }
            case ChallengeInvitationRefusedNotification n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setGuestId(n.getGuestId());
            }
            case ChallengeInvitationCanceledNotification n -> {
                dto.setChallengeName(n.getChallengeName());
                dto.setProposerId(n.getProposerId());
            }
            case ChallengeInvitationNotification n -> dto.setProposerId(n.getProposerId());
            default -> {
            }
        }
        return dto;
    }

    public abstract List<NotificationDTO> toDTO(List<Notification> notifications);

    private Long toMillis(Date date) {
        return date != null ? date.getTime() : null;
    }

}
