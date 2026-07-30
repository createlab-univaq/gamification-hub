package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.criteria.RuleCriteria;
import it.createlab.gamificationhub.api.model.dto.RuleDTO;
import it.createlab.gamificationhub.api.model.dto.ValidationMessageDTO;

import java.util.List;

public interface RuleService {

    RuleDTO get(String id);

    List<RuleDTO> get(RuleCriteria ruleCriteria);

    RuleDTO insert(RuleDTO ruleDTO);

    RuleDTO update(RuleDTO ruleDTO);

    void delete(String id);

    List<ValidationMessageDTO> validate(RuleDTO ruleDTO);

}
