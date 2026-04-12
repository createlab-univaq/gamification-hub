package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.ChallengeModel;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.BadgeCollectionMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.PointConceptMapper;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games/{gameId}/challenges")
@Slf4j
public class ChallengeController extends BaseGameController {

    public ChallengeController(GameService gameService, GameMapper gameMapper, ChallengeMapper challengeMapper, PointConceptMapper pointConceptMapper, BadgeCollectionMapper badgeCollectionMapper) {
        super(gameService, gameMapper, challengeMapper, pointConceptMapper, badgeCollectionMapper);
    }

    @GetMapping
    public ResponseEntity<Collection<ChallengeDTO>> getGameChallenges(@PathVariable final String gameId) {
        log.info("Get challenges for game={}", gameId);
        Set<ChallengeDTO> challengeDTOS = gameService.readChallengeModels(gameId)
                .stream().map(challengeMapper::toDTO)
                .collect(Collectors.toSet());
        return ResponseEntity.ok(challengeDTOS);
    }

    @PostMapping
    public ResponseEntity<ChallengeDTO> addGameChallenge(@PathVariable final String gameId, @RequestBody @Valid ChallengeDTO challengeDTO) {
        log.info("Add new challenge={} to game={}", challengeDTO, gameId);
        if(!Objects.isNull(challengeDTO.getId())) {
            throw new EntityCreationException("Challenge", "A new game challenge cannot already have an ID");
        }
        Game game = findGameByIdOrThrow(gameId);
        challengeDTO.setGameId(game.getId());
        ChallengeModel saved = gameService.saveChallengeModel(game.getId(), challengeMapper.toEntity(challengeDTO));
        return new ResponseEntity<>(challengeMapper.toDTO(saved), HttpStatus.CREATED);
    }

    @PutMapping("/{challengeId}")
    public ResponseEntity<ChallengeDTO> updateGameChallenge(@PathVariable final String gameId, @PathVariable final String challengeId, @RequestBody @Valid ChallengeDTO challengeDTO) {
        log.info("Update challenge={} of game={} with={}", challengeId, gameId, challengeDTO);
        Game game = findGameByIdOrThrow(gameId);
        ChallengeModel challengeModel = Objects.requireNonNullElseGet(
                gameService.readChallengeModel(game.getId(), challengeId),
                () -> {
                    throw new EntityNotFoundException("Challenge", challengeId);
                }
        );
        challengeDTO.setGameId(game.getId());
        challengeDTO.setId(challengeId);
        challengeMapper.updateEntity(challengeModel, challengeDTO);
        challengeModel = gameService.saveChallengeModel(gameId, challengeModel);
        return ResponseEntity.ok(challengeMapper.toDTO(challengeModel));
    }

    @DeleteMapping("/{challengeId}")
    public ResponseEntity<Void> deleteGameChallenge(@PathVariable final String gameId, @PathVariable final String challengeId) {
        log.info("Delete challenge={} of game={}", challengeId, gameId);
        gameService.deleteChallengeModel(gameId, challengeId);
        return ResponseEntity.noContent().build();
    }

}
