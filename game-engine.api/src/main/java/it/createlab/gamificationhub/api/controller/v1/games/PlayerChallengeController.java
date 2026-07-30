package it.createlab.gamificationhub.api.controller.v1.games;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.createlab.gamificationhub.api.model.dto.ChallengeAssignmentDTO;
import it.createlab.gamificationhub.api.model.dto.ChallengeEditDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.ChallengeConceptDTO;
import it.createlab.gamificationhub.api.service.PlayerChallengeService;
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
@Tag(name = "Player Challenges", description = "Handle player challenges")
public class PlayerChallengeController {

    private final PlayerChallengeService playerChallengeService;

    @Operation(summary = "Assign challenge", description = "Assign a challenge to the player")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<ChallengeConceptDTO> assignChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @RequestBody ChallengeAssignmentDTO assignment) {
        log.info("Assign challenge to player={} in game={}", playerId, gameId);
        return new ResponseEntity<>(playerChallengeService.assign(gameId, playerId, assignment), HttpStatus.CREATED);
    }

    @Operation(summary = "Get challenges", description = "List all challenges of a player")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<ChallengeConceptDTO>> getChallenges(@PathVariable String gameId,
            @PathVariable String playerId) {
        log.info("Get challenges of player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.list(gameId, playerId));
    }

    @Operation(summary = "Get challenge", description = "Retrieves the particular challenge assigned to the player")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{instanceName}")
    public ResponseEntity<ChallengeConceptDTO> getChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName) {
        log.info("Get challenge={} of player={} in game={}", instanceName, playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.get(gameId, playerId, instanceName));
    }

    @Operation(summary = "Edit challenge", description = "Update challenge definition for a player")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{instanceName}")
    public ResponseEntity<ChallengeConceptDTO> editChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName,
            @RequestBody ChallengeEditDTO edit) {
        log.info("Edit challenge={} of player={} in game={}", instanceName, playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.edit(gameId, playerId, instanceName, edit));
    }

    @Operation(summary = "Accept challenge", description = "Accept a proposed challenge")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/{instanceName}/accept")
    public ResponseEntity<ChallengeConceptDTO> acceptChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName) {
        log.info("Accept challenge={} of player={} in game={}", instanceName, playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.accept(gameId, playerId, instanceName));
    }

    @Operation(summary = "Force challenge", description = "Forces the challenge choice of a player")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/force-choice")
    public ResponseEntity<ChallengeConceptDTO> forceChallengeChoice(@PathVariable String gameId,
            @PathVariable String playerId) {
        log.info("Force challenge choice for player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(playerChallengeService.forceChoice(gameId, playerId));
    }

    @Operation(summary = "Delete challenge", description = "Deletes player challenge")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{instanceName}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable String gameId,
            @PathVariable String playerId, @PathVariable String instanceName) {
        log.info("Delete challenge={} of player={} in game={}", instanceName, playerId, gameId);
        playerChallengeService.delete(gameId, playerId, instanceName);
        return ResponseEntity.noContent().build();
    }

}
