package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import lombok.Data;

import java.util.List;

@Data
public class BadgeCollectionDTO {
    private String name;
    private List<String> badges;
}
