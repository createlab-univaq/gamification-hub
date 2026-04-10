package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PointConceptDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/model/game/{gameId}/point")
@Slf4j
@RequiredArgsConstructor
public class PointConceptController {

    private final GameService gameService;

    @GetMapping
    public ResponseEntity<List<PointConceptDTO>> getPoints(@PathVariable String gameId) {
        log.info("Get points for game={}", gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(gameId);
        List<PointConceptDTO> points = concepts.stream()
                .filter(gc -> gc instanceof PointConcept)
                .map(gc -> toDTO((PointConcept) gc))
                .collect(Collectors.toList());
        return ResponseEntity.ok(points);
    }

    @GetMapping("/{pointId}")
    public ResponseEntity<PointConceptDTO> getPoint(@PathVariable String gameId,
            @PathVariable String pointId) {
        log.info("Get point={} for game={}", pointId, gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(gameId);
        return concepts.stream()
                .filter(gc -> gc instanceof PointConcept && pointId.equals(gc.getId()))
                .map(gc -> ResponseEntity.ok(toDTO((PointConcept) gc)))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("PointConcept", pointId));
    }

    @PostMapping
    public ResponseEntity<PointConceptDTO> addPoint(@PathVariable String gameId,
            @RequestBody PointConceptDTO dto) {
        log.info("Add point name={} to game={}", dto.getName(), gameId);
        PointConcept point = new PointConcept(dto.getName());
        point.setId(UUID.randomUUID().toString());
        gameService.addConceptInstance(gameId, point);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(point));
    }

    @DeleteMapping("/{pointId}")
    public ResponseEntity<Void> deletePoint(@PathVariable String gameId,
            @PathVariable String pointId) {
        log.info("Delete point={} from game={}", pointId, gameId);
        var game = gameService.loadGameDefinitionById(gameId);
        if (game == null) {
            throw new EntityNotFoundException("Game", gameId);
        }
        boolean removed = game.getConcepts().removeIf(
                gc -> gc instanceof PointConcept && pointId.equals(gc.getId()));
        if (!removed) {
            throw new EntityNotFoundException("PointConcept", pointId);
        }
        gameService.saveGameDefinition(game);
        return ResponseEntity.noContent().build();
    }

    private PointConceptDTO toDTO(PointConcept point) {
        PointConceptDTO dto = new PointConceptDTO();
        dto.setId(point.getId());
        dto.setName(point.getName());
        return dto;
    }
}
