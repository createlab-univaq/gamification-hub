package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.services.GameService;
import it.createlab.gamificationhub.api.exception.EntityCreationException;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.model.criteria.PointConceptCriteria;
import it.createlab.gamificationhub.api.model.dto.PointConceptDTO;
import it.createlab.gamificationhub.api.model.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
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
@RequestMapping("/api/v1/games/{gameId}/point-concepts")
@Tag(name = "Point Concepts", description = "Manage a game's point concepts")
@Slf4j
@PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
public class PointConceptController extends BaseGameController {

    protected final PointConceptMapper pointConceptMapper;

    public PointConceptController(GameService gameService, GameMapper gameMapper, PointConceptMapper pointConceptMapper) {
        super(gameService, gameMapper);
        this.pointConceptMapper = pointConceptMapper;
    }

    @Operation(summary = "List point concepts", description = "Lists the game's point concepts, filtered by the given criteria.")
    @GetMapping
    public ResponseEntity<List<PointConceptDTO>> getPoints(@PathVariable String gameId, @ParameterObject PointConceptCriteria criteria) {
        log.info("Get points for game={} by criteria={}", gameId, criteria);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        List<PointConceptDTO> points = concepts.stream()
                .filter(gc -> gc instanceof PointConcept)
                .map(gc -> pointConceptMapper.toDTO((PointConcept) gc))
                .collect(Collectors.toList());
        return ResponseEntity.ok(PointConceptCriteria.filter(criteria, points));
    }

    @Operation(summary = "Get a point concept", description = "Returns a single point concept by id.")
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
                .orElseThrow(() -> new EntityNotFoundException("PointConcept", pointId, ErrorCodes.POINT_CONCEPT_NOT_FOUND));
    }

    @Operation(summary = "Add a point concept", description = "Creates a new point concept (score initialized to 0).")
    @PostMapping
    public ResponseEntity<PointConceptDTO> addPoint(@PathVariable String gameId,
                                                    @RequestBody PointConceptDTO dto) {
        log.info("REST request to add point={} to game={}", dto, gameId);
        if(!Objects.isNull(dto.getId())) {
            throw new EntityCreationException("Point Concept", "A new point concept cannot already have an ID", ErrorCodes.POINT_CONCEPT_CREATION);
        }
        Game game = findGameByIdOrThrow(gameId);
        PointConcept point = pointConceptMapper.toEntity(dto);
        point.setId(UUID.randomUUID().toString().replaceAll("-", "").strip());
        point.setScore(0.0);
        gameService.addConceptInstance(game.getId(), point);
        return ResponseEntity.status(HttpStatus.CREATED).body(pointConceptMapper.toDTO(point));
    }

    @Operation(summary = "Update a point concept", description = "Updates an existing point concept.")
    @PatchMapping("/{pointId}")
    public ResponseEntity<PointConceptDTO> updatePoint(@PathVariable String gameId, @PathVariable String pointId, @RequestBody PointConceptDTO pointConceptDTO) {
        log.info("REST request to update point={} of game={} with={}", pointId, gameId, pointConceptDTO);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> concepts = gameService.readConceptInstances(game.getId());
        pointConceptDTO.setId(pointId);
        // Extract the point-concept
        PointConcept pc = concepts.stream()
                .filter(gc -> gc instanceof PointConcept && pointId.equals(gc.getId()))
                .findFirst()
                .map(gc -> (PointConcept) gc)
                .orElseThrow(() -> new EntityNotFoundException("PointConcept", pointId, ErrorCodes.POINT_CONCEPT_NOT_FOUND));

        // Update the point-concept
        pointConceptDTO.setId(pointId);
        pointConceptMapper.updateEntity(pc, pointConceptDTO);

        // Exclude the old point-concept from the game definition
        Set<GameConcept> filteredConcepts = concepts.stream()
            .filter(gc -> !pointId.equals(gc.getId()))
            .collect(Collectors.toSet());

        // Add the new version and save the game
        filteredConcepts.add(pc);
        game.setConcepts(filteredConcepts);
        gameService.saveGameDefinition(game);

        return ResponseEntity.ok(pointConceptMapper.toDTO(pc));
    }

    @Operation(summary = "Delete a point concept", description = "Removes a point concept from the game.")
    @DeleteMapping("/{pointId}")
    public ResponseEntity<Void> deletePoint(@PathVariable String gameId,
                                            @PathVariable String pointId) {
        log.info("Delete point={} from game={}", pointId, gameId);
        Game game = findGameByIdOrThrow(gameId);
        Set<GameConcept> filteredConcepts = game.getConcepts().stream()
                .filter(gc -> gc instanceof PointConcept && !pointId.equals(gc.getId()))
                .collect(Collectors.toSet());
        game.setConcepts(filteredConcepts);
        gameService.saveGameDefinition(game);
        return ResponseEntity.noContent().build();
    }

}
