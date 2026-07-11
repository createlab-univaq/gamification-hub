package it.smartcommunitylab.gamification.gameengineapi.config.security;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.UserNotAuthorizedException;
import it.smartcommunitylab.gamification.gameengineapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.stereotype.Component;

import java.util.Objects;

@RequiredArgsConstructor
@Component
public class MethodSecurityDetails {

    private final GameService gameService;

    public boolean canAccessGame(String gameId) {
        Game game = gameService.loadGameDefinitionById(gameId);
        if (Objects.isNull(game)) {
            throw new EntityNotFoundException("Game", gameId, ErrorCodes.GAME_NOT_FOUND);
        }
        DomainUserDetails user = SecurityUtils.getCurrentUser();
        if (Objects.isNull(user)) {
            throw new UserNotAuthorizedException();
        }
        return Objects.equals(user.getId(), game.getOwner());
    }

}
