package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.TeamDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.TeamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/teams")
@Slf4j
public class TeamController extends BaseGameController {

    private final TeamService teamService;

    public TeamController(GameService gameService, GameMapper gameMapper, TeamService teamService) {
        super(gameService, gameMapper);
        this.teamService = teamService;
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getTeams(@PathVariable String gameId) {
        log.info("REST request to get teams of game {}", gameId);
        findGameByIdOrThrow(gameId);
        return ResponseEntity.ok(teamService.getTeams(gameId));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable String gameId, @PathVariable String teamId) {
        log.info("REST request to get team {} of game {}", teamId, gameId);
        findGameByIdOrThrow(gameId);
        return ResponseEntity.ok(teamService.getTeam(gameId, teamId));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@PathVariable String gameId, @RequestBody TeamDTO team) {
        log.info("REST request to create team {} in game {}", team, gameId);
        findGameByIdOrThrow(gameId);
        team.setGameId(gameId);
        return new ResponseEntity<>(teamService.create(team), HttpStatus.CREATED);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable String gameId, @PathVariable String teamId, @RequestBody TeamDTO team) {
        log.info("REST request to update team {} of game {}", teamId, gameId);
        findGameByIdOrThrow(gameId);
        team.setGameId(gameId);
        team.setId(teamId);
        return ResponseEntity.ok(teamService.update(team));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String gameId, @PathVariable String teamId) {
        log.info("REST request to delete team {} of game {}", teamId, gameId);
        findGameByIdOrThrow(gameId);
        teamService.delete(gameId, teamId);
        return ResponseEntity.noContent().build();
    }

}
