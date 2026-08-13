package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/*
 * The list representation of a player: identity and rank only. A player's concepts,
 * challenges and period history are reached through the single-player endpoint, since
 * they are unbounded and a listing has no use for them.
 */
@Data
public class PlayerSummaryDTO {

    private String playerId;

    private String gameId;

    private List<PlayerLevelDTO> levels = new ArrayList<>();

}
