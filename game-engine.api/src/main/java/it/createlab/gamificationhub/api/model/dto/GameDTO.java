package it.createlab.gamificationhub.api.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Set<GameTask> tasks;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Set<GameConcept> concepts;
    private long expiration;
    private boolean terminated;
}
