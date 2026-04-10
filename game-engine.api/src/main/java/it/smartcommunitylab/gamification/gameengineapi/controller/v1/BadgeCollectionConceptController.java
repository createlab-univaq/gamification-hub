package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.BadgeCollectionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/model/game/{gameId}/badges")
@Slf4j
@RequiredArgsConstructor
public class BadgeCollectionConceptController {

    private final GameService gameService;

    @GetMapping
    public ResponseEntity<List<BadgeCollectionDTO>> getBadgeCollections(
            @PathVariable String gameId) {
        log.info("Get badge collections for game={}", gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(gameId);
        List<BadgeCollectionDTO> badges = concepts.stream()
                .filter(gc -> gc instanceof BadgeCollectionConcept)
                .map(gc -> toDTO((BadgeCollectionConcept) gc))
                .collect(Collectors.toList());
        return ResponseEntity.ok(badges);
    }

    @GetMapping("/{collectionId}")
    public ResponseEntity<BadgeCollectionDTO> getBadgeCollection(
            @PathVariable String gameId, @PathVariable String collectionId) {
        log.info("Get badge collection={} for game={}", collectionId, gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(gameId);
        return concepts.stream()
                .filter(gc -> gc instanceof BadgeCollectionConcept && collectionId.equals(gc.getId()))
                .map(gc -> ResponseEntity.ok(toDTO((BadgeCollectionConcept) gc)))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("BadgeCollectionConcept", collectionId));
    }

    @PostMapping
    public ResponseEntity<BadgeCollectionDTO> addBadgeCollection(
            @PathVariable String gameId, @RequestBody BadgeCollectionDTO dto) {
        log.info("Add badge collection name={} to game={}", dto.getName(), gameId);
        BadgeCollectionConcept badge = new BadgeCollectionConcept(dto.getName());
        gameService.addConceptInstance(gameId, badge);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(badge));
    }

    @DeleteMapping("/{collectionId}")
    public ResponseEntity<Void> deleteBadgeCollection(
            @PathVariable String gameId, @PathVariable String collectionId) {
        log.info("Delete badge collection={} from game={}", collectionId, gameId);
        var game = gameService.loadGameDefinitionById(gameId);
        if (game == null) {
            throw new EntityNotFoundException("Game", gameId);
        }
        boolean removed = game.getConcepts().removeIf(
                gc -> gc instanceof BadgeCollectionConcept && collectionId.equals(gc.getId()));
        if (!removed) {
            throw new EntityNotFoundException("BadgeCollectionConcept", collectionId);
        }
        gameService.saveGameDefinition(game);
        return ResponseEntity.noContent().build();
    }

    private BadgeCollectionDTO toDTO(BadgeCollectionConcept badge) {
        BadgeCollectionDTO dto = new BadgeCollectionDTO();
        dto.setId(badge.getId());
        dto.setName(badge.getName());
        dto.setBadges(badge.getBadgeEarned());
        return dto;
    }
}
