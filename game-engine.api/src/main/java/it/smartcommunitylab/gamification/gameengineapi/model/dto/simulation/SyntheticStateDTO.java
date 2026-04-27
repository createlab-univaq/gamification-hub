package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SyntheticStateDTO {
    private String playerId;
    private List<String> actionIds;
    private List<PointConceptDTO> pointConcepts;
    private List<BadgeCollectionDTO> badgeCollections;
    private List<ChallengeConceptDTO> challenges;
    private Map<String, Object> customData;
}
