package it.createlab.gamificationhub.api.controller.v1.games;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.createlab.gamificationhub.api.model.criteria.RuleCriteria;
import it.createlab.gamificationhub.api.model.dto.RuleDTO;
import it.createlab.gamificationhub.api.model.dto.ValidationMessageDTO;
import it.createlab.gamificationhub.api.service.RuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/rules")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Rules", description = "Manage the rules of a game")
public class RuleController {

    private final RuleService ruleService;

    @Operation(summary = "Get rules", description = "Lists the rules of a game filtered by the given criteria")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<RuleDTO>> getRules(@PathVariable String gameId, @ParameterObject RuleCriteria ruleCriteria) {
        log.info("Get rules for game={} by criteria={}", gameId, ruleCriteria);
        ruleCriteria.setGameId(gameId);
        List<RuleDTO> rules = ruleService.get(ruleCriteria);
        return ResponseEntity.ok(rules);
    }

    @Operation(summary = "Get rule", description = "Retrieves a specific game rule")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{ruleId}")
    public ResponseEntity<RuleDTO> getRule(@PathVariable final String gameId, @PathVariable String ruleId) {
        log.info("Get rule={} of game={}", ruleId, gameId);
        RuleDTO ruleDTO = ruleService.get(ruleId);
        return ResponseEntity.ok(ruleDTO);
    }

    @Operation(summary = "Add rule", description = "Create a new rule in the game")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<RuleDTO> addRule(@PathVariable final String gameId, @RequestBody @Valid RuleDTO ruleDTO) {
        log.info("Add rule name={} to game={}", ruleDTO.getName(), gameId);
        ruleDTO.setGameId(gameId);
        ruleDTO = ruleService.insert(ruleDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleDTO);
    }

    @Operation(summary = "Edit rule", description = "Update an existing rule")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{ruleId}")
    public ResponseEntity<RuleDTO> editRule(@PathVariable final String gameId, @PathVariable String ruleId, @RequestBody RuleDTO ruleDTO) {
        log.info("Edit rule={} in game={}", ruleId, gameId);
        ruleDTO.setGameId(gameId);
        RuleDTO existing = ruleService.get(ruleId);
        ruleDTO.setId(existing.getId());
        return ResponseEntity.ok(ruleService.update(ruleDTO));
    }

    @Operation(summary = "Delete rule", description = "Removes a game rule forever")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable final String gameId, @PathVariable String ruleId) {
        log.info("Delete rule={}", ruleId);
        ruleService.delete(ruleId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Validate rule", description = "Validates a rule's content against the game without persisting it.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/validate")
    public ResponseEntity<List<ValidationMessageDTO>> validateRule(@PathVariable final String gameId, @RequestBody RuleDTO ruleDTO) {
        log.info("Validate rule for game={}", ruleDTO.getGameId());
        ruleDTO.setGameId(gameId);
        return ResponseEntity.ok(ruleService.validate(ruleDTO));
    }

}
