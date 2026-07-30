package it.createlab.gamificationhub.api.model.criteria;

import lombok.Data;

@Data
public class NotificationCriteria {

    private String playerId;

    private String type;

    private long fromTs = -1;

    private long toTs = -1;

}
