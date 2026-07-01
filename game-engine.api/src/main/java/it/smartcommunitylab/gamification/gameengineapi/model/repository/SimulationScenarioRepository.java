package it.smartcommunitylab.gamification.gameengineapi.model.repository;

import it.smartcommunitylab.gamification.gameengineapi.model.entity.SimulationScenario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SimulationScenarioRepository extends MongoRepository<SimulationScenario, String> {

    List<SimulationScenario> findByGameId(String gameId);

    Optional<SimulationScenario> findByGameIdAndName(String gameId, String name);

}
