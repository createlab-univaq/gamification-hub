package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PointConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.BadgeCollectionMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.PointConceptMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games/{gameId}/point-concepts")
@Slf4j
public class PointConceptController extends BaseGameController {

    public PointConceptController(GameService gameService, GameMapper gameMapper, ChallengeMapper challengeMapper, PointConceptMapper pointConceptMapper, BadgeCollectionMapper badgeCollectionMapper) {
        super(gameService, gameMapper, challengeMapper, pointConceptMapper, badgeCollectionMapper);
    }

    @GetMapping
    public ResponseEntity<List<PointConceptDTO>> getPoints(@PathVariable String gameId) {
        log.info("Get points for game={}", gameId);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        List<PointConceptDTO> points = concepts.stream()
                .filter(gc -> gc instanceof PointConcept)
                .map(gc -> pointConceptMapper.toDTO((PointConcept) gc))
                .collect(Collectors.toList());
        return ResponseEntity.ok(points);
    }

    @GetMapping("/{pointId}")
    public ResponseEntity<PointConceptDTO> getPoint(@PathVariable String gameId,
                                                    @PathVariable String pointId) {
        log.info("Get point={} for game={}", pointId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        return concepts.stream()
                .filter(gc -> gc instanceof PointConcept && pointId.equals(gc.getId()))
                .map(gc -> ResponseEntity.ok(pointConceptMapper.toDTO((PointConcept) gc)))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("PointConcept", pointId));
    }

    @PostMapping
    public ResponseEntity<PointConceptDTO> addPoint(@PathVariable String gameId,
                                                    @RequestBody PointConceptDTO dto) {
        log.info("Add point name={} to game={}", dto.getName(), gameId);
        if(!Objects.isNull(dto.getId())) {
            throw new EntityCreationException("Point Concept", "A new point concept cannot already have an ID");
        }
        Game game = findGameByIdOrThrow(gameId);
        PointConcept point = pointConceptMapper.toEntity(dto);
        point.setScore(0.0);
        gameService.addConceptInstance(game.getId(), point);
        return ResponseEntity.status(HttpStatus.CREATED).body(pointConceptMapper.toDTO(point));
    }

    @DeleteMapping("/{pointId}")
    public ResponseEntity<Void> deletePoint(@PathVariable String gameId,
                                            @PathVariable String pointId) {
        log.info("Delete point={} from game={}", pointId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        boolean removed = game.getConcepts().removeIf(
                gc -> gc instanceof PointConcept && pointId.equals(gc.getId()));
        if (removed) {
            gameService.saveGameDefinition(game);
        }
        return ResponseEntity.noContent().build();
    }

}
