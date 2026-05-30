package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.GamePersistanceDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ImportGameDTO;

import java.util.List;

public interface ImportService {

    List<GamePersistanceDTO> importGames(List<ImportGameDTO> games);

}
