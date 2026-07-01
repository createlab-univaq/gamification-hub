package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import eu.trentorise.game.model.CustomData;
import eu.trentorise.game.model.Inventory;
import eu.trentorise.game.model.PlayerLevel;
import eu.trentorise.game.model.core.GameConcept;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDTO implements Serializable {

    private String playerId;

    private String gameId;

    private List<PlayerLevel> levels = new ArrayList<>();

    private Set<GameConcept> state = new HashSet<GameConcept>();

    private CustomData customData = new CustomData();

    private Inventory inventory = new Inventory();

}
