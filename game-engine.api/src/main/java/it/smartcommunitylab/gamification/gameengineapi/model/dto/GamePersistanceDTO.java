package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import eu.trentorise.game.model.Level;
import eu.trentorise.game.model.Settings;
import eu.trentorise.game.repo.GenericObjectPersistence;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
public class GamePersistanceDTO {

    private String id;

    private String name;

    private String owner;

    private String domain;

    private Set<String> actions = new HashSet<String>();

    private Set<GenericObjectPersistence> tasks = new HashSet<GenericObjectPersistence>();

    private Set<String> rules = new HashSet<String>();

    private Set<GenericObjectPersistence> concepts = new HashSet<GenericObjectPersistence>();

    private List<Level> levels = new ArrayList<>();

    private long expiration;

    private boolean terminated;

    private Settings settings;

    private List<String> notifyPCName;

}
