package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDTO {

    private String type;

    private String gameId;

    private String playerId;

    private long timestamp;

    // BadgeNotification
    private String badge;
    private String collectionName;

    // Challenge* notifications
    private String challengeName;
    private String model;
    private String pointConcept;
    private String guestId;
    private String proposerId;
    private Long start;
    private Long end;

    // ClassificationNotification
    private String classificationName;
    private Integer classificationPosition;

    // GameNotification
    private String actionId;
    private Map<String, Object> dataPayLoad;
    private Map<String, Double> scoreMap;
    private Map<String, Double> deltaMap;

    // LevelGainedNotification
    private String levelName;
    private String levelType;
    private Integer levelIndex;

    // MessageNotification
    private String key;
    private Map<String, Object> data;

}
