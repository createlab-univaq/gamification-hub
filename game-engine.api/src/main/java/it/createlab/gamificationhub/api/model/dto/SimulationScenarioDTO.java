package it.createlab.gamificationhub.api.model.dto;

import it.createlab.gamificationhub.api.model.dto.simulation.SyntheticStateDTO;
import lombok.Data;

@Data
public class SimulationScenarioDTO {

    private String id;

    private String gameId;

    private String name;

    private SyntheticStateDTO syntheticState;

    private SyntheticStateDTO expectedOutput;

}
