package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.DBRule;
import eu.trentorise.game.repo.RuleRepo;
import eu.trentorise.game.services.GameEngine;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RuleValidationException;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.RuleCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ValidationMessageDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.RuleMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ValidationMessageMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.RuleService;
import it.smartcommunitylab.gamification.gameengineapi.utils.KieErrorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
import org.drools.drl.parser.MessageImpl;
import org.kie.api.builder.Message;
import org.springframework.stereotype.Service;

import java.io.StringReader;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleServiceImpl implements RuleService {

    private static final String CONSTANTS_RULE_NAME = "constants";

    private final GameService gameService;
    private final GameEngine gameEngine;
    private final RuleRepo ruleRepo;
    private final RuleMapper ruleMapper;
    private final ValidationMessageMapper validationMessageMapper;

    private List<ValidationMessageDTO> validateContent(RuleDTO ruleDTO) {
        if (CONSTANTS_RULE_NAME.equals(ruleDTO.getName())) {
            return validateProperties(ruleDTO.getContent());
        }
        Map<String, Message> errors = KieErrorUtil.parseErrors(
                gameEngine.validateGame(ruleDTO.getGameId(), ruleDTO.getContent(), ruleDTO.getName())
        );
        for(Message m : errors.values()) {
            log.info("[{}, {}] : {}", m.getLevel(), m.getClass(), m.getText());
        }
        return errors.values().stream().map(e->{
            if(e instanceof MessageImpl eimpl){
                return eimpl;
            }
            return null;
        }).filter(message -> !Objects.isNull(message)).map(validationMessageMapper::toDTO).toList();
    }

    private List<ValidationMessageDTO> validateProperties(String content) {
        List<ValidationMessageDTO> errors = new ArrayList<>();
        try {
            PropertiesConfiguration props = new PropertiesConfiguration();
            props.setListDelimiter(',');
            props.load(new StringReader(content == null ? "" : content));
        } catch (ConfigurationException e) {
            errors.add(
                    ValidationMessageDTO.builder()
                            .id(UUID.randomUUID().node())
                            .level(Message.Level.ERROR)
                            .text(e.getMessage())
                            .build()
            );
        }
        return errors;
    }

    private void validateOrThrow(RuleDTO ruleDTO) {
        List<ValidationMessageDTO> errors = validateContent(ruleDTO);
        boolean hasBlockingErrors = errors.stream().anyMatch(e->e.getLevel().equals(Message.Level.ERROR));
        if (hasBlockingErrors) {
            throw new RuleValidationException(errors);
        }
    }

    @Override
    public RuleDTO get(String id) {
        log.info("Request to get rule={}", id);
        DBRule rule = ruleRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Rule", id, ErrorCodes.RULE_NOT_FOUND));
        return ruleMapper.toDTO(rule);
    }

    @Override
    public List<RuleDTO> get(RuleCriteria ruleCriteria) {
        log.info("Request to get rules by criteria: {}", ruleCriteria);
        Game game = gameService.loadGameDefinitionById(ruleCriteria.getGameId());
        if (Objects.isNull(game)) {
            throw new EntityNotFoundException("Game", ruleCriteria.getGameId(), ErrorCodes.GAME_NOT_FOUND);
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
        validateOrThrow(ruleDTO);
        DBRule rule = new DBRule(ruleDTO.getGameId(), ruleDTO.getContent());
        rule.setName(ruleDTO.getName());
        String ruleUrl = gameService.addRule(rule);
        ruleDTO.setId(ruleUrl);
        return ruleMapper.toDTO(rule);
    }

    @Override
    public RuleDTO update(RuleDTO ruleDTO) {
        log.info("Request to edit rule");
        validateOrThrow(ruleDTO);
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
    public List<ValidationMessageDTO> validate(RuleDTO ruleDTO) {
        log.info("Request to validate rule for game={}", ruleDTO.getGameId());
        return validateContent(ruleDTO);
    }

}
