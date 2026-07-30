package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.GroupChallenge.Attendee;
import it.createlab.gamificationhub.api.model.dto.AttendeeDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class, uses = TimeMapper.class)
public interface AttendeeMapper extends EntityMapper<AttendeeDTO, Attendee> {
}
