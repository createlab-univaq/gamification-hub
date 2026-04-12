package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.config.security.DomainUserDetails;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GameDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.BadgeCollectionMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.PointConceptMapper;
import it.smartcommunitylab.gamification.gameengineapi.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games")
@Slf4j
public class GameController extends BaseGameController {

    public GameController(GameService gameService, GameMapper gameMapper, ChallengeMapper challengeMapper, PointConceptMapper pointConceptMapper, BadgeCollectionMapper badgeCollectionMapper) {
        super(gameService, gameMapper, challengeMapper, pointConceptMapper, badgeCollectionMapper);
    }

    @PostMapping
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO gameDTO) {
        log.info("Create game name={}", gameDTO.getName());
        if (!Objects.isNull(gameDTO.getId())) {
            throw new EntityCreationException("Game", "A new game cannot already have an ID");
        }
        DomainUserDetails user = SecurityUtils.getCurrentUser();
        if (Objects.isNull(user)) {
            throw new UsernameNotFoundException("Cannot create game if user is not authenticated");
        }
        gameDTO.setOwner(user.getId());
        Game game = gameMapper.toEntity(gameDTO);
        Game saved = gameService.saveGameDefinition(game);
        return ResponseEntity.status(HttpStatus.CREATED).body(gameMapper.toDTO(saved));
    }

    @GetMapping("/{gameId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<GameDTO> getGame(@PathVariable String gameId) {
        log.info("Get game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        return ResponseEntity.ok(gameMapper.toDTO(game));
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getGames() {
        log.info("Get all games");
        DomainUserDetails userDetails = SecurityUtils.getCurrentUser();
        List<GameDTO> games = gameService.loadGameByOwner(userDetails.getId()).stream()
                .map(gameMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(games);
    }

    @PutMapping("/{gameId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<GameDTO> updateGame(@PathVariable String gameId, @RequestBody GameDTO gameDTO) {
        log.info("Update game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        gameDTO.setId(gameId);
        gameMapper.updateEntity(game, gameDTO);
        Game saved = gameService.saveGameDefinition(game);
        return ResponseEntity.ok(gameMapper.toDTO(saved));
    }

    @DeleteMapping("/{gameId}")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    public ResponseEntity<Void> deleteGame(@PathVariable String gameId) {
        log.info("Delete game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        gameService.deleteGame(game.getId());
        return ResponseEntity.noContent().build();
    }

}
