package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.core.ChallengeAssignment;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeAssignmentDTO;
import org.mapstruct.Mapper;

import java.time.Instant;
import java.util.Date;

@Mapper(config = EntityMapper.class)
public interface ChallengeAssignmentMapper extends EntityMapper<ChallengeAssignmentDTO, ChallengeAssignment> {

    default Date map(Instant instant) {
        return instant != null ? Date.from(instant) : null;
    }

    default Instant map(Date date) {
        return date != null ? date.toInstant() : null;
    }

}
