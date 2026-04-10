package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.model.core.GameTask;
import lombok.Data;

import java.util.Set;

@Data
public class GameDTO {
    private String id;
    private String name;
    private String owner;
    private String domain;
    private Set<String> actions;
    private Set<String> rules;
    private Set<GameTask> tasks;
    private Set<GameConcept> concepts;
    private long expiration;
    private boolean terminated;
}
