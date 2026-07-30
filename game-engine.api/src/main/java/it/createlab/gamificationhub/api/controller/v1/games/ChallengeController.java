package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.model.ChallengeModel;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.createlab.gamificationhub.api.exception.EntityCreationException;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.model.dto.ChallengeDTO;
import it.createlab.gamificationhub.api.model.mapper.ChallengeMapper;
import it.createlab.gamificationhub.api.model.mapper.GameMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games/{gameId}/challenges")
@Tag(name = "Challenge Models", description = "Manage a game's challenge models")
@Slf4j
@PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
public class ChallengeController extends BaseGameController {

    private final ChallengeMapper challengeMapper;

    public ChallengeController(GameService gameService, GameMapper gameMapper, ChallengeMapper challengeMapper) {
        super(gameService, gameMapper);
        this.challengeMapper = challengeMapper;
    }

    @Operation(summary = "List challenge models", description = "Lists the challenge models defined in the game.")
    @GetMapping
    public ResponseEntity<Collection<ChallengeDTO>> getGameChallenges(@PathVariable final String gameId) {
        log.info("Get challenges for game={}", gameId);
        Set<ChallengeDTO> challengeDTOS = gameService.readChallengeModels(gameId)
                .stream().map(challengeMapper::toDTO)
                .collect(Collectors.toSet());
        return ResponseEntity.ok(challengeDTOS);
    }

    @Operation(summary = "Add a challenge model", description = "Creates a new challenge model in the game.")
    @PostMapping
    public ResponseEntity<ChallengeDTO> addGameChallenge(@PathVariable final String gameId, @RequestBody @Valid ChallengeDTO challengeDTO) {
        log.info("Add new challenge={} to game={}", challengeDTO, gameId);
        if (!Objects.isNull(challengeDTO.getId())) {
            throw new EntityCreationException("Challenge", "A new game challenge cannot already have an ID", ErrorCodes.CHALLENGE_CREATION);
        }
        Game game = findGameByIdOrThrow(gameId);
        challengeDTO.setGameId(game.getId());
        ChallengeModel saved = gameService.saveChallengeModel(game.getId(), challengeMapper.toEntity(challengeDTO));
        return new ResponseEntity<>(challengeMapper.toDTO(saved), HttpStatus.CREATED);
    }

    @Operation(summary = "Update a challenge model", description = "Updates an existing challenge model.")
    @PutMapping("/{challengeId}")
    public ResponseEntity<ChallengeDTO> updateGameChallenge(@PathVariable final String gameId, @PathVariable final String challengeId, @RequestBody @Valid ChallengeDTO challengeDTO) {
        log.info("Update challenge={} of game={} with={}", challengeId, gameId, challengeDTO);
        Game game = findGameByIdOrThrow(gameId);
        ChallengeModel challengeModel = Objects.requireNonNullElseGet(
                gameService.readChallengeModel(game.getId(), challengeId),
                () -> {
                    throw new EntityNotFoundException("Challenge", challengeId, ErrorCodes.CHALLENGE_NOT_FOUND);
                }
        );
        challengeDTO.setGameId(game.getId());
        challengeDTO.setId(challengeId);
        challengeMapper.updateEntity(challengeModel, challengeDTO);
        challengeModel = gameService.saveChallengeModel(gameId, challengeModel);
        return ResponseEntity.ok(challengeMapper.toDTO(challengeModel));
    }

    @Operation(summary = "Delete a challenge model", description = "Removes a challenge model from the game.")
    @DeleteMapping("/{challengeId}")
    public ResponseEntity<Void> deleteGameChallenge(@PathVariable final String gameId, @PathVariable final String challengeId) {
        log.info("Delete challenge={} of game={}", challengeId, gameId);
        gameService.deleteChallengeModel(gameId, challengeId);
        return ResponseEntity.noContent().build();
    }

}
