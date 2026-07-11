package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.util.Set;

@Data
public class ChallengeDTO {

    private String id;

    private String name;
    
    private Set<String> variables;

    private String gameId;

}
