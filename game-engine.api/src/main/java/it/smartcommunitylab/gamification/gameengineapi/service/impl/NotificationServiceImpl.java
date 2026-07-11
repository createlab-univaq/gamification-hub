package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.managers.NotificationManager;
import eu.trentorise.game.model.core.Notification;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.NotificationCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.NotificationDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.NotificationMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationManager notificationManager;

    private final NotificationMapper notificationMapper;

    @Override
    public List<NotificationDTO> getNotifications(String gameId, NotificationCriteria criteria, Pageable pageable) {
        List<String> includeTypes = StringUtils.hasText(criteria.getType()) ? List.of(criteria.getType()) : null;

        List<Notification> notifications = StringUtils.hasText(criteria.getPlayerId())
                ? notificationManager.readNotifications(gameId, criteria.getPlayerId(), criteria.getFromTs(), criteria.getToTs(), includeTypes, null, pageable)
                : notificationManager.readNotifications(gameId, criteria.getFromTs(), criteria.getToTs(), includeTypes, null, pageable);

        return notificationMapper.toDTO(notifications);
    }

}
