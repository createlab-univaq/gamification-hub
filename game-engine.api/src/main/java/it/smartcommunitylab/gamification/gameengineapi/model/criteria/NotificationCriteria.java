package it.smartcommunitylab.gamification.gameengineapi.model.criteria;

import lombok.Data;

@Data
public class NotificationCriteria {

    private String playerId;

    private String type;

    private long fromTs = -1;

    private long toTs = -1;

}
