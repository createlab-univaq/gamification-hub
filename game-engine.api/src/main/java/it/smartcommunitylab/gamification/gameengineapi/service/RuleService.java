package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.RuleCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;

import java.util.List;
import java.util.Map;

public interface RuleService {

    RuleDTO get(String id);

    List<RuleDTO> get(RuleCriteria ruleCriteria);

    RuleDTO insert(RuleDTO ruleDTO);

    RuleDTO update(RuleDTO ruleDTO);

    void delete(String id);

    Map<String, Object> validate(RuleDTO ruleDTO);

}
