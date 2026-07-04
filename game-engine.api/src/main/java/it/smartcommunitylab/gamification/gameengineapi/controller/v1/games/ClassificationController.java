package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import it.smartcommunitylab.gamification.gameengineapi.model.criteria.ClassificationCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationBoardDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.ClassificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/classifications")
@Slf4j
@RequiredArgsConstructor
public class ClassificationController {

    private final ClassificationService classificationService;

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<ClassificationDTO>> getClassifications(@PathVariable String gameId,
            @ParameterObject ClassificationCriteria criteria) {
        log.info("Get classifications for game={} by criteria={}", gameId, criteria);
        return ResponseEntity.ok(classificationService.get(gameId, criteria));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{classificationId}")
    public ResponseEntity<ClassificationDTO> getClassification(@PathVariable String gameId,
            @PathVariable String classificationId) {
        log.info("Get classification={} of game={}", classificationId, gameId);
        return ResponseEntity.ok(classificationService.get(gameId, classificationId));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PostMapping
    public ResponseEntity<ClassificationDTO> createClassification(@PathVariable String gameId,
            @RequestBody @Valid ClassificationDTO classificationDTO) {
        log.info("Create classification={} in game={}", classificationDTO.getName(), gameId);
        classificationDTO.setGameId(gameId);
        return new ResponseEntity<>(classificationService.create(classificationDTO), HttpStatus.CREATED);
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @PutMapping("/{classificationId}")
    public ResponseEntity<ClassificationDTO> updateClassification(@PathVariable String gameId,
            @PathVariable String classificationId, @RequestBody @Valid ClassificationDTO classificationDTO) {
        log.info("Update classification={} of game={}", classificationId, gameId);
        classificationDTO.setGameId(gameId);
        classificationDTO.setId(classificationId);
        return ResponseEntity.ok(classificationService.update(classificationDTO));
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @DeleteMapping("/{classificationId}")
    public ResponseEntity<Void> deleteClassification(@PathVariable String gameId,
            @PathVariable String classificationId) {
        log.info("Delete classification={} of game={}", classificationId, gameId);
        classificationService.delete(gameId, classificationId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping("/{classificationId}/board")
    public ResponseEntity<ClassificationBoardDTO> getClassificationBoard(@PathVariable String gameId,
            @PathVariable String classificationId,
            @RequestParam(defaultValue = "-1") long timestamp,
            @RequestParam(defaultValue = "-1") int periodInstanceIndex,
            @ParameterObject Pageable pageable) {
        log.info("Get board of classification={} of game={}", classificationId, gameId);
        return ResponseEntity.ok(classificationService.getBoard(gameId, classificationId, timestamp,
                periodInstanceIndex, pageable));
    }

}
