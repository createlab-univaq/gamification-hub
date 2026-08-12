package it.createlab.gamificationhub.api.service.impl;

import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.repo.StatePersistence;
import it.createlab.gamificationhub.api.service.PlayerStateSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlayerStateSyncServiceImpl implements PlayerStateSyncService {

    private final MongoTemplate mongoTemplate;

    @Override
    public long syncPointConceptPeriods(String gameId, PointConcept concept,
                                       Collection<String> previousPeriodIds) {
        String conceptPath = "concepts.PointConcept." + concept.getName();
        Map<String, ? extends PointConcept.Period> periods = concept.getPeriods();

        // A period whose start is missing would break every score change, so it is never propagated.
        List<String> toWrite = periods.entrySet().stream()
                .filter(entry -> entry.getValue().getStart() != null)
                .map(Map.Entry::getKey)
                .toList();
        List<String> toRemove = previousPeriodIds.stream()
                .filter(id -> !periods.containsKey(id))
                .toList();

        if (toWrite.isEmpty() && toRemove.isEmpty()) {
            return 0;
        }

        Update update = new Update();
        toWrite.forEach(id -> {
            PointConcept.Period period = periods.get(id);
            String path = conceptPath + ".obj.periods." + id;
            update.set(path + ".identifier", period.getIdentifier() != null ? period.getIdentifier() : id);
            // Stored as epoch millis rather than a BSON date, matching what Jackson writes.
            update.set(path + ".start", period.getStart().getTime());
            update.set(path + ".end", period.getEnd().map(Date::getTime).orElse(null));
            update.set(path + ".period", period.getPeriod());
            update.set(path + ".capacity", period.getCapacity());
        });
        toRemove.forEach(id -> update.unset(conceptPath + ".obj.periods." + id));

        Query query = new Query(Criteria.where("gameId").is(gameId).and(conceptPath).exists(true));
        long modified = mongoTemplate.updateMulti(query, update, StatePersistence.class).getModifiedCount();

        log.info("Synced point concept {} of game {} into {} player state(s): {} period(s) written, {} removed",
                concept.getName(), gameId, modified, toWrite.size(), toRemove.size());
        return modified;
    }

}
