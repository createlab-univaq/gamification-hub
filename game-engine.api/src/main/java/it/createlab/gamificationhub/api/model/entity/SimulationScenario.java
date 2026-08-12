package it.createlab.gamificationhub.api.model.entity;

import it.createlab.gamificationhub.api.model.dto.simulation.SyntheticStateDTO;
import java.time.Instant;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@EqualsAndHashCode(callSuper = true)
@Document("scenarios")
@CompoundIndex(name = "scenario_game_name_unique", def = "{'gameId': 1, 'name': 1}", unique = true)
@Data
public class SimulationScenario extends BaseEntity<String> {

    @Id
    private String id;

    private String gameId;

    private String name;

    private SyntheticStateDTO syntheticState;

    private SyntheticStateDTO expectedOutput;

    private Instant executionMoment;

}
