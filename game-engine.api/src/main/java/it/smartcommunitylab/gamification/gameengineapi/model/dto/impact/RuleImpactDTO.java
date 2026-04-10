package it.smartcommunitylab.gamification.gameengineapi.model.dto.impact;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class RuleImpactDTO {
    private String ruleName;
    private Set<String> reads;
    private Set<String> writes;
    private List<ActivationLinkDTO> activates;
}
