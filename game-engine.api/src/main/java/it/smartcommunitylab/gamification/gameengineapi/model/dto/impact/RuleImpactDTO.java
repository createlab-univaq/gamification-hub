package it.smartcommunitylab.gamification.gameengineapi.model.dto.impact;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ConceptChangeDTO;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class RuleImpactDTO {
    private String ruleName;
    private Set<ConceptChangeDTO> reads;
    private Set<ConceptChangeDTO> writes;
    private List<ActivationLinkDTO> activates;
}
