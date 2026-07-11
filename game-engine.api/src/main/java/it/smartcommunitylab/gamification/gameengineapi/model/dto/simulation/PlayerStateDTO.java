package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.BadgeCollectionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GroupChallengeDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.InventoryDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PointConceptDTO;
import lombok.Data;

import java.util.List;

@Data
public class PlayerStateDTO {
    private String playerId;
    private String gameId;
    private List<PointConceptDTO> pointConcepts;
    private List<BadgeCollectionDTO> badgeCollections;
    private List<ChallengeConceptDTO> challenges;
    private InventoryDTO inventory;
    private List<GroupChallengeDTO> groupChallenges;
}
