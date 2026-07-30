package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.criteria.NotificationCriteria;
import it.createlab.gamificationhub.api.model.dto.NotificationDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    List<NotificationDTO> getNotifications(String gameId, NotificationCriteria criteria, Pageable pageable);

}
