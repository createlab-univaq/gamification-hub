package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GameDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/model/game")
@Slf4j
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO gameDTO) {
        log.info("Create game name={}", gameDTO.getName());
        Game game = toEntity(gameDTO);
        Game saved = gameService.saveGameDefinition(game);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameDTO> getGame(@PathVariable String gameId) {
        log.info("Get game={}", gameId);
        Game game = gameService.loadGameDefinitionById(gameId);
        if (game == null) {
            throw new EntityNotFoundException("Game", gameId);
        }
        return ResponseEntity.ok(toDTO(game));
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getGames() {
        log.info("Get all games");
        List<GameDTO> games = gameService.loadAllGames().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(games);
    }

    @PutMapping("/{gameId}")
    public ResponseEntity<GameDTO> updateGame(@PathVariable String gameId, @RequestBody GameDTO gameDTO) {
        log.info("Update game={}", gameId);
        Game existing = gameService.loadGameDefinitionById(gameId);
        if (existing == null) {
            throw new EntityNotFoundException("Game", gameId);
        }
        gameDTO.setId(gameId);
        Game saved = gameService.saveGameDefinition(toEntity(gameDTO));
        return ResponseEntity.ok(toDTO(saved));
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<Void> deleteGame(@PathVariable String gameId) {
        log.info("Delete game={}", gameId);
        Game game = gameService.loadGameDefinitionById(gameId);
        if (game == null) {
            throw new EntityNotFoundException("Game", gameId);
        }
        gameService.deleteGame(gameId);
        return ResponseEntity.noContent().build();
    }

    // --- helpers ---

    private Game toEntity(GameDTO dto) {
        Game game = new Game();
        game.setId(dto.getId());
        game.setName(dto.getName());
        game.setOwner(dto.getOwner());
        game.setDomain(dto.getDomain());
        game.setActions(dto.getActions());
        game.setRules(dto.getRules());
        game.setExpiration(dto.getExpiration());
        game.setTerminated(dto.isTerminated());
        game.setTasks(dto.getTasks());
        game.setConcepts(dto.getConcepts());
        return game;
    }

    private GameDTO toDTO(Game game) {
        GameDTO dto = new GameDTO();
        dto.setId(game.getId());
        dto.setName(game.getName());
        dto.setOwner(game.getOwner());
        dto.setDomain(game.getDomain());
        dto.setActions(game.getActions());
        dto.setRules(game.getRules());
        dto.setExpiration(game.getExpiration());
        dto.setTerminated(game.isTerminated());
        return dto;
    }
}
