package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.DBRule;
import eu.trentorise.game.repo.RuleRepo;
import eu.trentorise.game.services.GameEngine;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.RuleValidationException;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.RuleCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.RuleMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.RuleService;
import it.smartcommunitylab.gamification.gameengineapi.utils.KieErrorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kie.api.builder.Message;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleServiceImpl implements RuleService {

    private final GameService gameService;
    private final GameEngine gameEngine;
    private final RuleRepo ruleRepo;
    private final RuleMapper ruleMapper;

    private void validateOrThrow(String gameId, String content) {
        Map<String, Message> errors = gameEngine.validateRule(gameId, content);
        if (!errors.isEmpty()) {
            throw new RuleValidationException(KieErrorUtil.parseErrors(errors));
        }
    }

    @Override
    public RuleDTO get(String id) {
        log.info("Request to get rule={}", id);
        DBRule rule = ruleRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Rule", id));
        return ruleMapper.toDTO(rule);
    }

    @Override
    public List<RuleDTO> get(RuleCriteria ruleCriteria) {
        log.info("Request to get rules by criteria: {}", ruleCriteria);
        Game game = gameService.loadGameDefinitionById(ruleCriteria.getGameId());
        if (Objects.isNull(game)) {
            throw new EntityNotFoundException("Game", ruleCriteria.getGameId());
        }
        List<RuleDTO> rules = new ArrayList<>();
        for (String ruleUrl : game.getRules()) {
            DBRule rule = (DBRule) gameService.loadRule(game.getId(), ruleUrl);
            if (rule != null) {
                rules.add(ruleMapper.toDTO(rule));
            }
        }
        return RuleCriteria.filter(ruleCriteria, rules);
    }

    @Override
    public RuleDTO insert(RuleDTO ruleDTO) {
        log.info("Add rule name={} to game={}", ruleDTO.getName(), ruleDTO.getGameId());
        validateOrThrow(ruleDTO.getGameId(), ruleDTO.getContent());
        DBRule rule = new DBRule(ruleDTO.getGameId(), ruleDTO.getContent());
        rule.setName(ruleDTO.getName());
        String ruleUrl = gameService.addRule(rule);
        ruleDTO.setId(ruleUrl);
        return ruleMapper.toDTO(rule);
    }

    @Override
    public RuleDTO update(RuleDTO ruleDTO) {
        log.info("Request to edit rule");
        validateOrThrow(ruleDTO.getGameId(), ruleDTO.getContent());
        String ruleUrl = gameService.addRule(ruleMapper.toEntity(ruleDTO));
        ruleDTO.setId(ruleUrl);
        return ruleDTO;
    }

    @Override
    public void delete(String id) {
        log.info("Request to delete rule={}", id);
        Optional<DBRule> existing = ruleRepo.findById(id);
        existing.ifPresent(dbRule -> gameService.deleteRule(dbRule.getGameId(), DBRule.URL_PROTOCOL + id));
    }

    @Override
    public Map<String, Object> validate(RuleDTO ruleDTO) {
        log.info("Request to validate rule for game={}", ruleDTO.getGameId());
        return KieErrorUtil.parseErrors(
                gameEngine.validateRule(ruleDTO.getGameId(), ruleDTO.getContent()
                ));
    }

}
