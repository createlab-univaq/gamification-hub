package it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SyntheticStateDTO {
    @NotBlank
    private String playerId;
    @NotEmpty
    private List<PointConceptDTO> pointConcepts;
    private List<BadgeCollectionDTO> badgeCollections;
}
