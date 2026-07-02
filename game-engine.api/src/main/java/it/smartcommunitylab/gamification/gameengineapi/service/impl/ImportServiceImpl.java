package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.repo.GamePersistence;
import eu.trentorise.game.repo.GameRepo;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.config.security.DomainUserDetails;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.RuleCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GamePersistanceDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ImportGameDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.GamePersistanceMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.RuleMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.ImportService;
import it.smartcommunitylab.gamification.gameengineapi.service.RuleService;
import it.smartcommunitylab.gamification.gameengineapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportServiceImpl implements ImportService {

    private final GameService gameService;

    private final GameRepo gameRepo;

    private final RuleMapper ruleMapper;

    private final ChallengeMapper challengeMapper;

    private final GamePersistanceMapper gamePersistanceMapper;

    private final RuleService ruleService;


    @Override
    public List<ImportGameDTO> exportGames(List<String> gameIds) {
        log.info("Export request for {} games", gameIds.size());
        return gameIds.stream().map(this::exportGame).toList();
    }

    @Override
    public ImportGameDTO exportGame(String gameId) {
        log.info("Export request for game {}", gameId);
        DomainUserDetails user = SecurityUtils.getCurrentUser();
        if (Objects.isNull(user)) {
            throw new UsernameNotFoundException("Cannot export game if user is not authenticated");
        }
        GamePersistence game = gameRepo.findById(gameId)
                .orElseThrow(() -> new EntityNotFoundException("Game", gameId, ErrorCodes.GAME_NOT_FOUND));
        if (!Objects.equals(user.getId(), game.getOwner())) {
            throw new RequestException("Forbidden", "You cannot export this game", ErrorCodes.EXPORT_FORBIDDEN, HttpStatus.FORBIDDEN);
        }

        ImportGameDTO export = new ImportGameDTO();
        export.setGame(gamePersistanceMapper.toDTO(game));
        export.setChallengeModels(gameService.readChallengeModels(gameId).stream()
                .map(challengeMapper::toDTO)
                .toList());

        RuleCriteria criteria = new RuleCriteria();
        criteria.setGameId(gameId);
        export.setRules(ruleService.get(criteria));

        return export;
    }

    @Override
    public List<GamePersistanceDTO> importGames(List<ImportGameDTO> games) {
        log.info("Import request for {} games", games.size());
        DomainUserDetails user = SecurityUtils.getCurrentUser();
        if (Objects.isNull(user)) {
            throw new UsernameNotFoundException("Cannot create game if user is not authenticated");
        }
        Set<String> savedIds = new HashSet<>();
        try {
            return games.stream().map(imp -> {
                GamePersistence game = gamePersistanceMapper.toEntity(imp.getGame());
                game.setRules(null);
                game.setId(null);
                game.setOwner(user.getId());
                GamePersistence savedGame = gameRepo.save(game);
                savedIds.add(savedGame.getId());
                imp.getChallengeModels().forEach(c -> {
                    c.setId(null);
                    c.setGameId(savedGame.getId());
                    gameService.saveChallengeModel(savedGame.getId(), challengeMapper.toEntity(c));
                });
                imp.getRules().forEach(r -> {
                    r.setId(null);
                    r.setGameId(savedGame.getId());
                    gameService.addRule(ruleMapper.toEntity(r));
                });
                return gamePersistanceMapper.toDTO(savedGame);
            }).toList();
        } catch (Exception e) {
            log.error(e.getMessage());
            // Rollback for every game that was saved.
            savedIds.forEach(gameService::deleteGame);
            throw new RequestException("Import Error", e.getLocalizedMessage(), ErrorCodes.IMPORT_ERROR, HttpStatus.BAD_REQUEST);
        }
    }
}
