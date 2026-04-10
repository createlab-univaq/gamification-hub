package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import lombok.Data;

import java.util.List;

@Data
public class PlayerStateDTO {
    private String playerId;
    private String gameId;
    private List<PointConceptDTO> pointConcepts;
    private List<BadgeCollectionDTO> badgeCollections;
    private List<ChallengeConceptDTO> challenges;
}
