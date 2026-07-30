package it.createlab.gamificationhub.api.model.repository;

import it.createlab.gamificationhub.api.model.entity.SimulationScenario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SimulationScenarioRepository extends MongoRepository<SimulationScenario, String> {

    List<SimulationScenario> findByGameId(String gameId);

    Optional<SimulationScenario> findByGameIdAndName(String gameId, String name);

}
