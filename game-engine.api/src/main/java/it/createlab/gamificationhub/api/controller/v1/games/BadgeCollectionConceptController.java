package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.services.GameService;
import it.createlab.gamificationhub.api.exception.EntityCreationException;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.model.dto.BadgeCollectionDTO;
import it.createlab.gamificationhub.api.model.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games/{gameId}/badges")
@Tag(name = "Badges", description = "Manage a game's badge collections")
@Slf4j
@PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
public class BadgeCollectionConceptController extends BaseGameController {

    protected final BadgeCollectionMapper badgeCollectionMapper;

    public BadgeCollectionConceptController(GameService gameService, GameMapper gameMapper, BadgeCollectionMapper badgeCollectionMapper) {
        super(gameService, gameMapper);
        this.badgeCollectionMapper = badgeCollectionMapper;
    }

    @Operation(summary = "List badge collections", description = "Lists the game's badge collection concepts.")
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

    @Operation(summary = "Get a badge collection", description = "Returns a single badge collection concept by id.")
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
                .orElseThrow(() -> new EntityNotFoundException("BadgeCollectionConcept", collectionId, ErrorCodes.BADGE_NOT_FOUND));
    }

    @Operation(summary = "Add a badge collection", description = "Creates a new badge collection concept.")
    @PostMapping
    public ResponseEntity<BadgeCollectionDTO> addBadgeCollection(
            @PathVariable String gameId, @RequestBody BadgeCollectionDTO dto) {
        log.info("Add badge collection name={} to game={}", dto.getName(), gameId);
        if (!Objects.isNull(dto.getId())) {
            throw new EntityCreationException("Badge Collection", "New badge collections cannot already have an ID", ErrorCodes.BADGE_CREATION);
        }
        Game game = findGameByIdOrThrow(gameId);
        BadgeCollectionConcept badge = badgeCollectionMapper.toEntity(dto);
        badge.setId(UUID.randomUUID().toString().replaceAll("-", "").strip());
        gameService.addConceptInstance(game.getId(), badge);
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeCollectionMapper.toDTO(badge));
    }

    @Operation(summary = "Update a badge collection", description = "Updates an existing badge collection concept.")
    @PutMapping("/{collectionId}")
    public ResponseEntity<BadgeCollectionDTO> updateBadgeCollection(
            @PathVariable String gameId, @PathVariable String collectionId, @RequestBody BadgeCollectionDTO dto) {
        log.info("Update badge collection={} of game={}", collectionId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        BadgeCollectionConcept badge = concepts.stream()
                .filter(gc -> gc instanceof BadgeCollectionConcept && collectionId.equals(gc.getId()))
                .map(gc -> (BadgeCollectionConcept) gc)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("BadgeCollectionConcept", collectionId, ErrorCodes.BADGE_NOT_FOUND));

        dto.setId(collectionId);
        badgeCollectionMapper.updateEntity(badge, dto);

        Set<GameConcept> filteredConcepts = concepts.stream()
                .filter(gc -> !collectionId.equals(gc.getId()))
                .collect(Collectors.toSet());
        filteredConcepts.add(badge);
        game.setConcepts(filteredConcepts);
        gameService.saveGameDefinition(game);

        return ResponseEntity.ok(badgeCollectionMapper.toDTO(badge));
    }

    @Operation(summary = "Delete a badge collection", description = "Removes a badge collection concept from the game.")
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
