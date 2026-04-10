package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.DBRule;
import eu.trentorise.game.repo.RuleRepo;
import eu.trentorise.game.services.GameEngine;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/rules")
@Slf4j
@RequiredArgsConstructor
public class RuleController {

    private final GameService gameService;
    private final GameEngine gameEngine;
    private final RuleRepo ruleRepo;

    @GetMapping
    public ResponseEntity<List<RuleDTO>> getRules(@RequestParam String gameId) {
        log.info("Get rules for game={}", gameId);
        Game game = gameService.loadGameDefinitionById(gameId);
        if (game == null) {
            throw new EntityNotFoundException("Game", gameId);
        }
        List<RuleDTO> rules = new ArrayList<>();
        for (String ruleUrl : game.getRules()) {
            DBRule rule = (DBRule) gameService.loadRule(gameId, ruleUrl);
            if (rule != null) {
                rules.add(toDTO(rule));
            }
        }
        return ResponseEntity.ok(rules);
    }

    @GetMapping("/{ruleId}")
    public ResponseEntity<RuleDTO> getRule(@PathVariable String ruleId) {
        log.info("Get rule={}", ruleId);
        DBRule rule = ruleRepo.findById(ruleId).orElseThrow(() -> new EntityNotFoundException("Rule", ruleId));
        return ResponseEntity.ok(toDTO(rule));
    }

    @PostMapping
    public ResponseEntity<RuleDTO> addRule(@RequestBody @Valid RuleDTO ruleDTO) {
        log.info("Add rule name={} to game={}", ruleDTO.getName(), ruleDTO.getGameId());
        validateOrThrow(ruleDTO.getGameId(), ruleDTO.getContent());
        DBRule rule = new DBRule(ruleDTO.getGameId(), ruleDTO.getContent());
        rule.setName(ruleDTO.getName());
        String ruleUrl = gameService.addRule(rule);
        ruleDTO.setId(ruleUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleDTO);
    }

    @PutMapping("/{ruleId}")
    public ResponseEntity<RuleDTO> editRule(@PathVariable String ruleId, @RequestBody RuleDTO ruleDTO) {
        log.info("Edit rule={} in game={}", ruleId, ruleDTO.getGameId());
        DBRule existing = (DBRule) gameService.loadRule(ruleDTO.getGameId(), DBRule.URL_PROTOCOL + ruleId);
        if (existing == null) {
            throw new EntityNotFoundException("Rule", ruleId);
        }
        validateOrThrow(ruleDTO.getGameId(), ruleDTO.getContent());
        existing.setName(ruleDTO.getName());
        existing.setContent(ruleDTO.getContent());
        String ruleUrl = gameService.addRule(existing);
        ruleDTO.setId(ruleUrl);
        return ResponseEntity.ok(ruleDTO);
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable String ruleId) {
        log.info("Delete rule={}", ruleId);
        Optional<DBRule> existing = ruleRepo.findById(ruleId);
        existing.ifPresent(dbRule -> gameService.deleteRule(dbRule.getGameId(), DBRule.URL_PROTOCOL + ruleId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<List<String>> validateRule(@RequestBody RuleDTO ruleDTO) {
        log.info("Validate rule for game={}", ruleDTO.getGameId());
        List<String> errors = gameEngine.validateRule(ruleDTO.getGameId(), ruleDTO.getContent());
        return ResponseEntity.ok(errors);
    }

    // --- helpers ---

    private void validateOrThrow(String gameId, String content) {
        List<String> errors = gameEngine.validateRule(gameId, content);
        if (!errors.isEmpty()) {
            throw new RequestException(
                    "Rule validation failed",
                    String.join("; ", errors),
                    HttpStatus.UNPROCESSABLE_ENTITY
            );
        }
    }

    private RuleDTO toDTO(DBRule rule) {
        RuleDTO dto = new RuleDTO();
        dto.setId(rule.getId());
        dto.setName(rule.getName());
        dto.setContent(rule.getContent());
        return dto;
    }
}
