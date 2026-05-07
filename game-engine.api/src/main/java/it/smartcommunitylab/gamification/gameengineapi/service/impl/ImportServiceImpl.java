package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.repo.GamePersistence;
import eu.trentorise.game.repo.GameRepo;
import eu.trentorise.game.services.GameService;
import it.smartcommunitylab.gamification.gameengineapi.config.security.DomainUserDetails;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ImportGameDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ChallengeMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.RuleMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.ImportService;
import it.smartcommunitylab.gamification.gameengineapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportServiceImpl implements ImportService {

    private final GameService gameService;

    private final GameRepo gameRepo;

    private final RuleMapper ruleMapper;

    private final ChallengeMapper challengeMapper;


    @Override
    public List<GamePersistence> importGames(List<ImportGameDTO> games) {
        DomainUserDetails user = SecurityUtils.getCurrentUser();
        if (Objects.isNull(user)) {
            throw new UsernameNotFoundException("Cannot create game if user is not authenticated");
        }
        try {
            return games.stream().map(imp -> {
                GamePersistence game = imp.getGame();
                game.setRules(null);
                game.setId(null);
                game.setOwner(user.getId());
                GamePersistence savedGame = gameRepo.save(game);
                log.info("{}", savedGame.getId());
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
                return savedGame;
            }).toList();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RequestException("Import Error", e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
