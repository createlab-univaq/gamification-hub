package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TeamDTO {

    private String id;

    private String gameId;

    private String name;

    private List<String> members = new ArrayList<>();

}
