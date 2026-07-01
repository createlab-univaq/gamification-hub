package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.SyntheticStateDTO;
import lombok.Data;

@Data
public class SimulationScenarioDTO {

    private String id;

    private String gameId;

    private String name;

    private SyntheticStateDTO syntheticState;

    private SyntheticStateDTO expectedOutput;

}
