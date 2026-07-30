package it.createlab.gamificationhub.api.controller.v1.games;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.createlab.gamificationhub.api.model.dto.ChallengeInvitationDTO;
import it.createlab.gamificationhub.api.model.dto.GroupChallengeDTO;
import it.createlab.gamificationhub.api.service.GroupChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/players/{playerId}/group-challenges")
@Slf4j
@Tag(name = "Group Challenges", description = "List, get, handle all group challenges invitations of a given player")
@RequiredArgsConstructor
public class GroupChallengeController {

    private final GroupChallengeService groupChallengeService;

    @Operation(summary = "Get all group challenges", description = "Lists the group challenges of the player.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<GroupChallengeDTO>> getGroupChallenges(@PathVariable String gameId,
                                                                      @PathVariable String playerId) {
        log.info("Get group challenges of player={} in game={}", playerId, gameId);
        return ResponseEntity.ok(groupChallengeService.list(gameId, playerId));
    }

    @Operation(summary = "Invite player", description = "Sends an invite to player for a group challenge")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/invitations")
    public ResponseEntity<GroupChallengeDTO> invite(@PathVariable String gameId,
                                                    @PathVariable String playerId, @RequestBody ChallengeInvitationDTO invitation) {
        log.info("Player={} creates group challenge invitation in game={}", playerId, gameId);
        return new ResponseEntity<>(groupChallengeService.invite(gameId, playerId, invitation), HttpStatus.CREATED);
    }

    @Operation(summary = "Accept invitation", description = "Accepts a pending invitation for a group challenge")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/{challengeName}/accept")
    public ResponseEntity<GroupChallengeDTO> acceptInvitation(@PathVariable String gameId,
                                                              @PathVariable String playerId, @PathVariable String challengeName) {
        log.info("Player={} accepts group challenge={} in game={}", playerId, challengeName, gameId);
        return ResponseEntity.ok(groupChallengeService.acceptInvitation(gameId, playerId, challengeName));
    }

    @Operation(summary = "Refuse invitation", description = "Refuse a pending invitation for a group challenge")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/{challengeName}/refuse")
    public ResponseEntity<GroupChallengeDTO> refuseInvitation(@PathVariable String gameId,
                                                              @PathVariable String playerId, @PathVariable String challengeName) {
        log.info("Player={} refuses group challenge={} in game={}", playerId, challengeName, gameId);
        return ResponseEntity.ok(groupChallengeService.refuseInvitation(gameId, playerId, challengeName));
    }

    @Operation(summary = "Cancel invitation", description = "Removes a pending invitation for a group challenge")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping("/{challengeName}/cancel")
    public ResponseEntity<GroupChallengeDTO> cancelInvitation(@PathVariable String gameId,
                                                              @PathVariable String playerId, @PathVariable String challengeName) {
        log.info("Player={} cancels group challenge={} in game={}", playerId, challengeName, gameId);
        return ResponseEntity.ok(groupChallengeService.cancelInvitation(gameId, playerId, challengeName));
    }

}
