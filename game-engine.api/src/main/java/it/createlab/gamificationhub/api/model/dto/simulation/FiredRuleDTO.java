package it.createlab.gamificationhub.api.model.dto.simulation;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class FiredRuleDTO {
    private String ruleName;
    private String cause;
    private Set<String> reads;
    private Set<String> writes;
    private List<ConceptChangeDTO> changes;
}
