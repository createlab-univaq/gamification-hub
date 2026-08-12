package it.createlab.gamificationhub.api.service;

import eu.trentorise.game.model.PointConcept;

import java.util.Collection;

public interface PlayerStateSyncService {

    long syncPointConceptPeriods(String gameId, PointConcept concept, Collection<String> previousPeriodIds);

}
