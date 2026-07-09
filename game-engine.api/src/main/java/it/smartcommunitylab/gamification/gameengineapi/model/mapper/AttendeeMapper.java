package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.GroupChallenge.Attendee;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.AttendeeDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = TimeMapper.class)
public interface AttendeeMapper extends EntityMapper<AttendeeDTO, Attendee> {
}
