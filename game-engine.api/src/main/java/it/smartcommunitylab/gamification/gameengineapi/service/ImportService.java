package it.smartcommunitylab.gamification.gameengineapi.service;

import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.repo.GamePersistence;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ImportGameDTO;

import java.util.List;

public interface ImportService {

    List<GamePersistence> importGames(List<ImportGameDTO> games);

}
