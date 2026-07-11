package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.NotificationCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.NotificationDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    List<NotificationDTO> getNotifications(String gameId, NotificationCriteria criteria, Pageable pageable);

}
