package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.managers.RuleImpactAnalyzer;
import eu.trentorise.game.model.impact.GameImpactResult;
import eu.trentorise.game.model.impact.RuleImpact;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.impact.ActivationLinkDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.impact.RuleImpactDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/model/game/{gameId}/impact")
@Slf4j
@RequiredArgsConstructor
public class ImpactAnalysisController {

    private final RuleImpactAnalyzer ruleImpactAnalyzer;

    @GetMapping
    public ResponseEntity<List<RuleImpactDTO>> analyzeGame(@PathVariable String gameId) {
        log.info("Impact analysis requested for game={}", gameId);
        GameImpactResult result = ruleImpactAnalyzer.analyze(gameId);
        List<RuleImpactDTO> dtos = result.getRules().entrySet().stream()
                .map(entry -> toDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private RuleImpactDTO toDTO(String ruleName, RuleImpact impact) {
        RuleImpactDTO dto = new RuleImpactDTO();
        dto.setRuleName(ruleName);
        dto.setReads(impact.getReads());
        dto.setWrites(impact.getWrites());
        dto.setActivates(impact.getActivates().stream()
                .map(link -> {
                    ActivationLinkDTO linkDTO = new ActivationLinkDTO();
                    linkDTO.setRuleName(link.getRuleName());
                    linkDTO.setReactivity(link.getReactivity());
                    return linkDTO;
                })
                .collect(Collectors.toList()));
        return dto;
    }
}
