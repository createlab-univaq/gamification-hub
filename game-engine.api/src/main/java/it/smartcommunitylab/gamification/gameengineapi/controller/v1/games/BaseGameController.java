package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.*;
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
            throw new EntityNotFoundException("Game", gameId);
        });
    }

}
