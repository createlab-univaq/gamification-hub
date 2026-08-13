package it.createlab.gamificationhub.api.model.dto.simulation;

import it.createlab.gamificationhub.api.model.dto.BadgeCollectionDTO;
import it.createlab.gamificationhub.api.model.dto.GroupChallengeDTO;
import it.createlab.gamificationhub.api.model.dto.InventoryDTO;
import it.createlab.gamificationhub.api.model.dto.PlayerLevelDTO;
import it.createlab.gamificationhub.api.model.dto.PointConceptDTO;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class PlayerStateDTO {
    private String playerId;
    private String gameId;
    private List<PointConceptDTO> pointConcepts;
    private List<BadgeCollectionDTO> badgeCollections;
    private List<ChallengeConceptDTO> challenges;
    private List<PlayerLevelDTO> levels;
    private InventoryDTO inventory;
    private Map<String, Object> customData;
    private List<GroupChallengeDTO> groupChallenges;
}
