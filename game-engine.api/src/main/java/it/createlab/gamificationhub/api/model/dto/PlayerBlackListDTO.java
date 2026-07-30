package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PlayerBlackListDTO {

    private String gameId;

    private String playerId;

    private List<String> blockedPlayers = new ArrayList<>();

}
