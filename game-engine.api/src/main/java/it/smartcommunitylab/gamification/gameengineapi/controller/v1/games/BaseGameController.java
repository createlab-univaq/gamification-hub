package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.BadgeCollectionMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.PointConceptMapper;
import lombok.RequiredArgsConstructor;

import java.util.Objects;

@RequiredArgsConstructor
public abstract class BaseGameController {

    protected final GameService gameService;

    protected final GameMapper gameMapper;

    protected final ChallengeMapper challengeMapper;

    protected final PointConceptMapper pointConceptMapper;

    protected final BadgeCollectionMapper badgeCollectionMapper;

    protected Game findGameByIdOrThrow(String gameId) {
        Game game = gameService.loadGameDefinitionById(gameId);
        return Objects.requireNonNull(game, () -> {
            throw new EntityNotFoundException("Game", gameId);
        });
    }

}
