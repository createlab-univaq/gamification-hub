package it.createlab.gamificationhub.api.service.impl;

import eu.trentorise.game.repo.GamePersistence;
import eu.trentorise.game.repo.GameRepo;
import eu.trentorise.game.repo.GenericObjectPersistence;
import eu.trentorise.game.services.GameService;
import it.createlab.gamificationhub.api.config.security.DomainUserDetails;
import it.createlab.gamificationhub.api.exception.EntityNotFoundException;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.exception.RequestException;
import it.createlab.gamificationhub.api.model.criteria.RuleCriteria;
import it.createlab.gamificationhub.api.model.dto.GamePersistanceDTO;
import it.createlab.gamificationhub.api.model.dto.ImportGameDTO;
import it.createlab.gamificationhub.api.model.dto.SimulationScenarioDTO;
import it.createlab.gamificationhub.api.model.entity.SimulationScenario;
import it.createlab.gamificationhub.api.model.mapper.ChallengeMapper;
import it.createlab.gamificationhub.api.model.mapper.GamePersistanceMapper;
import it.createlab.gamificationhub.api.model.mapper.RuleMapper;
import it.createlab.gamificationhub.api.model.mapper.ScenarioMapper;
import it.createlab.gamificationhub.api.model.repository.SimulationScenarioRepository;
import it.createlab.gamificationhub.api.service.ImportService;
import it.createlab.gamificationhub.api.service.RuleService;
import it.createlab.gamificationhub.api.utils.GameConceptUtils;
import it.createlab.gamificationhub.api.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;

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

    private final ScenarioMapper scenarioMapper;

    private final SimulationScenarioRepository simulationScenarioRepository;


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
        List<SimulationScenarioDTO> scenarios = scenarioMapper.toDTO(simulationScenarioRepository.findByGameId(gameId));
        ImportGameDTO export = new ImportGameDTO();
        export.setGame(gamePersistanceMapper.toDTO(game));
        export.setChallengeModels(gameService.readChallengeModels(gameId).stream()
                .map(challengeMapper::toDTO)
                .toList());
        export.setScenarios(scenarios);
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
        Set<String> savedScenarioIds = new HashSet<>();
        try {
            return games.stream().map(imp -> {
                stripAllIds(imp);
                GamePersistence game = gamePersistanceMapper.toEntity(imp.getGame());
                game.setRules(null);
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
                if (imp.getScenarios() != null && !imp.getScenarios().isEmpty()) {
                    imp.getScenarios().forEach(sc -> sc.setGameId(savedGame.getId()));
                    List<SimulationScenario> scenarios = simulationScenarioRepository.saveAll(scenarioMapper.toEntity(imp.getScenarios()));
                    savedScenarioIds.addAll(scenarios.stream().map(SimulationScenario::getId).toList());
                }
                return gamePersistanceMapper.toDTO(savedGame);
            }).toList();
        } catch (Exception e) {
            log.error("Game import failed, rolling back saved games", e);
            // Rollback for every game that was saved.
            savedIds.forEach(gameService::deleteGame);
            simulationScenarioRepository.deleteAllById(savedScenarioIds);
            throw new RequestException("Import Error", e.getLocalizedMessage(), ErrorCodes.IMPORT_ERROR, HttpStatus.BAD_REQUEST);
        }
    }

    private void stripAllIds(ImportGameDTO importGameDTO) {
        GamePersistanceDTO game = importGameDTO.getGame();
        game.setId(null);
        if (!Objects.isNull(game.getConcepts())) {
            for (GenericObjectPersistence gop : game.getConcepts()) {
                Map<String, Object> conceptMap = gop.getObj();
                if (conceptMap != null) {
                    conceptMap.put("id", GameConceptUtils.newId());
                }
            }
        }
        if (!Objects.isNull(importGameDTO.getScenarios())) {
            for (SimulationScenarioDTO scenarioDTO : importGameDTO.getScenarios()) {
                scenarioDTO.setId(null);
            }
        }
    }

}
