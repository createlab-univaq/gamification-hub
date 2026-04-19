package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.RuleCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RuleDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.RuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/games/{gameId}/rules")
@Slf4j
@RequiredArgsConstructor
public class RuleController {

    private final RuleService ruleService;

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<RuleDTO>> getRules(@PathVariable String gameId, @ParameterObject RuleCriteria ruleCriteria) {
        log.info("Get rules for game={} by criteria={}", gameId, ruleCriteria);
        ruleCriteria.setGameId(gameId);
        List<RuleDTO> rules = ruleService.get(ruleCriteria);
        return ResponseEntity.ok(rules);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{ruleId}")
    public ResponseEntity<RuleDTO> getRule(@PathVariable final String gameId, @PathVariable String ruleId) {
        log.info("Get rule={} of game={}", ruleId, gameId);
        RuleDTO ruleDTO = ruleService.get(ruleId);
        return ResponseEntity.ok(ruleDTO);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<RuleDTO> addRule(@PathVariable final String gameId, @RequestBody @Valid RuleDTO ruleDTO) {
        log.info("Add rule name={} to game={}", ruleDTO.getName(), gameId);
        ruleDTO.setGameId(gameId);
        ruleDTO = ruleService.insert(ruleDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleDTO);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{ruleId}")
    public ResponseEntity<RuleDTO> editRule(@PathVariable final String gameId, @PathVariable String ruleId, @RequestBody RuleDTO ruleDTO) {
        log.info("Edit rule={} in game={}", ruleId, gameId);
        ruleDTO.setGameId(gameId);
        RuleDTO existing = ruleService.get(ruleId);
        ruleDTO.setId(existing.getId());
        return ResponseEntity.ok(ruleService.update(ruleDTO));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable final String gameId, @PathVariable String ruleId) {
        log.info("Delete rule={}", ruleId);
        ruleService.delete(ruleId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateRule(@PathVariable final String gameId, @RequestBody RuleDTO ruleDTO) {
        log.info("Validate rule for game={}", ruleDTO.getGameId());
        ruleDTO.setGameId(gameId);
        return ResponseEntity.ok(ruleService.validate(ruleDTO));
    }

}
