package it.createlab.gamificationhub.api.model.criteria;

import it.createlab.gamificationhub.api.model.dto.GameDTO;
import lombok.Data;

import java.util.List;

@Data
public class GameCriteria {

    private String id;

    private String name;

    private String domain;

    private Boolean terminated;

    public static List<GameDTO> filter(GameCriteria criteria, List<GameDTO> games) {
        return games.stream()
                .filter(gameDTO -> {
                    // 1. If criteria.id is provided, it MUST match
                    if (criteria.id != null && !criteria.id.equals(gameDTO.getId())) {
                        return false;
                    }
                    // 2. If criteria.name is provided, it MUST be contained in the game name
                    if (criteria.name != null && !gameDTO.getName().contains(criteria.name)) {
                        return false;
                    }
                    // 3. If criteria.terminated is provided, it MUST match the game status
                    return criteria.terminated == null || gameDTO.isTerminated() == criteria.terminated;
                })
                .toList();
    }

}
