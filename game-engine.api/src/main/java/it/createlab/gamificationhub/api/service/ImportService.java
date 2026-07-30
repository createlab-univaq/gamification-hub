package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.dto.GamePersistanceDTO;
import it.createlab.gamificationhub.api.model.dto.ImportGameDTO;

import java.util.List;

public interface ImportService {

    List<GamePersistanceDTO> importGames(List<ImportGameDTO> games);

    ImportGameDTO exportGame(String gameId);

    List<ImportGameDTO> exportGames(List<String> gameIds);

}
