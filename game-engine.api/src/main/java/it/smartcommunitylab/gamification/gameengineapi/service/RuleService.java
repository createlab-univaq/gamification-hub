package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.RuleCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ValidationMessageDTO;

import java.util.List;

public interface RuleService {

    RuleDTO get(String id);

    List<RuleDTO> get(RuleCriteria ruleCriteria);

    RuleDTO insert(RuleDTO ruleDTO);

    RuleDTO update(RuleDTO ruleDTO);

    void delete(String id);

    List<ValidationMessageDTO> validate(RuleDTO ruleDTO);

}
