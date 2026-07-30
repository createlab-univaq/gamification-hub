package it.createlab.gamificationhub.api.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.model.mapper.*;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Objects;

@RequiredArgsConstructor
public abstract class BaseGameController {

    protected final GameService gameService;

    protected final GameMapper gameMapper;

    protected Game findGameByIdOrThrow(String gameId) {
        Game game = gameService.loadGameDefinitionById(gameId);
        return Objects.requireNonNull(game, () -> {
            throw new EntityNotFoundException("Game", gameId, ErrorCodes.GAME_NOT_FOUND);
        });
    }

}
