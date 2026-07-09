package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeAssignmentDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeEditDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.PlayerChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/players/{playerId}/challenges")
@Slf4j
@RequiredArgsConstructor
public class PlayerChallengeController {

    private final PlayerChallengeService playerChallengeService;

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<ChallengeConceptDTO> assignChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @RequestBody ChallengeAssignmentDTO assignment) {
        log.info("Assign challenge to player={} in game={}", playerId, gameId);
        return new ResponseEntity<>(playerChallengeService.assign(gameId, playerId, assignment), HttpStatus.CREATED);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<ChallengeConceptDTO>> getChallenges(@PathVariable String gameId,
            @PathVariable String playerId) {
        log.info("Get challenges of player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.list(gameId, playerId));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{instanceName}")
    public ResponseEntity<ChallengeConceptDTO> getChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName) {
        log.info("Get challenge={} of player={} in game={}", instanceName, playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.get(gameId, playerId, instanceName));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{instanceName}")
    public ResponseEntity<ChallengeConceptDTO> editChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName,
            @RequestBody ChallengeEditDTO edit) {
        log.info("Edit challenge={} of player={} in game={}", instanceName, playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.edit(gameId, playerId, instanceName, edit));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/{instanceName}/accept")
    public ResponseEntity<ChallengeConceptDTO> acceptChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName) {
        log.info("Accept challenge={} of player={} in game={}", instanceName, playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.accept(gameId, playerId, instanceName));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/force-choice")
    public ResponseEntity<ChallengeConceptDTO> forceChallengeChoice(@PathVariable String gameId,
            @PathVariable String playerId) {
        log.info("Force challenge choice for player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.forceChoice(gameId, playerId));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{instanceName}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName) {
        log.info("Delete challenge={} of player={} in game={}", instanceName, playerId, gameId);
        playerChallengeService.delete(gameId, playerId, instanceName);
        return ResponseEntity.noContent().build();
    }

}
