package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.ChallengeConcept;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ChallengeConceptMapper extends EntityMapper<ChallengeConceptDTO, ChallengeConcept> {
}
