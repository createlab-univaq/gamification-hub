package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.BadgeCollectionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.*;
import lombok.Builder;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games/{gameId}/badges")
@Slf4j
public class BadgeCollectionConceptController extends BaseGameController {

    protected final BadgeCollectionMapper badgeCollectionMapper;

    public BadgeCollectionConceptController(GameService gameService, GameMapper gameMapper, BadgeCollectionMapper badgeCollectionMapper) {
        super(gameService, gameMapper);
        this.badgeCollectionMapper = badgeCollectionMapper;
    }

    @GetMapping
    public ResponseEntity<List<BadgeCollectionDTO>> getBadgeCollections(
            @PathVariable String gameId) {
        log.info("Get badge collections for game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        List<BadgeCollectionDTO> badges = concepts.stream()
                .filter(gc -> gc instanceof BadgeCollectionConcept)
                .map(gc -> badgeCollectionMapper.toDTO((BadgeCollectionConcept) gc))
                .collect(Collectors.toList());
        return ResponseEntity.ok(badges);
    }

    @GetMapping("/{collectionId}")
    public ResponseEntity<BadgeCollectionDTO> getBadgeCollection(
            @PathVariable String gameId, @PathVariable String collectionId) {
        log.info("Get badge collection={} for game={}", collectionId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        return concepts.stream()
                .filter(gc -> gc instanceof BadgeCollectionConcept && collectionId.equals(gc.getId()))
                .map(gc -> ResponseEntity.ok(badgeCollectionMapper.toDTO((BadgeCollectionConcept) gc)))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("BadgeCollectionConcept", collectionId));
    }

    @PostMapping
    public ResponseEntity<BadgeCollectionDTO> addBadgeCollection(
            @PathVariable String gameId, @RequestBody BadgeCollectionDTO dto) {
        log.info("Add badge collection name={} to game={}", dto.getName(), gameId);
        if (!Objects.isNull(dto.getId())) {
            throw new EntityCreationException("Badge Collection", "New badge collections cannot already have an ID");
        }
        Game game = findGameByIdOrThrow(gameId);
        BadgeCollectionConcept badge = badgeCollectionMapper.toEntity(dto);
        gameService.addConceptInstance(game.getId(), badge);
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeCollectionMapper.toDTO(badge));
    }

    @DeleteMapping("/{collectionId}")
    public ResponseEntity<Void> deleteBadgeCollection(
            @PathVariable String gameId, @PathVariable String collectionId) {
        log.info("Delete badge collection={} from game={}", collectionId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        boolean removed = game.getConcepts().removeIf(
                gc -> gc instanceof BadgeCollectionConcept && collectionId.equals(gc.getId()));
        if (removed) {
            gameService.saveGameDefinition(game);
        }
        return ResponseEntity.noContent().build();
    }
}
