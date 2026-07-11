package it.smartcommunitylab.gamification.gameengineapi.controller.v1.games;

import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.NotificationCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.NotificationDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GameMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/{gameId}/notifications")
@Tag(name = "Notifications", description = "Read the notifications emitted by a game")
@Slf4j
public class NotificationController extends BaseGameController {

    private final NotificationService notificationService;

    public NotificationController(GameService gameService, GameMapper gameMapper, NotificationService notificationService) {
        super(gameService, gameMapper);
        this.notificationService = notificationService;
    }

    @Operation(summary = "List notifications", description = "Returns a paged list of the game's notifications, filtered by the given criteria.")
    @PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable String gameId,
                                                                  @ParameterObject NotificationCriteria criteria,
                                                                  @ParameterObject Pageable page) {
        log.info("Get notifications for game={} by criteria={}", gameId, criteria);
        findGameByIdOrThrow(gameId);
        return ResponseEntity.ok(notificationService.getNotifications(gameId, criteria, page));
    }

}
