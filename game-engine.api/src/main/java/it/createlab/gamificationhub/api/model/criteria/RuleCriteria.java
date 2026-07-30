package it.createlab.gamificationhub.api.model.criteria;

import it.createlab.gamificationhub.api.model.dto.RuleDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class RuleCriteria {

    private String id;

    private String name;

    @NotBlank
    private String gameId;

    public static List<RuleDTO> filter(RuleCriteria criteria, List<RuleDTO> rules) {
        return rules.stream()
                .filter(ruleDTO -> {
                    if (criteria.id != null && !criteria.id.equals(ruleDTO.getId())) {
                        return false;
                    }
                    if (criteria.name != null && !ruleDTO.getName().contains(criteria.name)) {
                        return false;
                    }
                    return criteria.gameId == null || ruleDTO.getGameId().contains(criteria.getGameId());
                })
                .toList();
    }

}
