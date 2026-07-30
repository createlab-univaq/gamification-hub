package it.createlab.gamificationhub.api.model.mapper;

import org.mapstruct.Mapper;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

@Mapper(config = EntityMapper.class)
public interface TimeMapper {

    default Instant toInstant(Date date) {
        return date != null ? date.toInstant() : null;
    }

    default Date toDate(Instant instant) {
        return instant != null ? Date.from(instant) : null;
    }

    default LocalDate toLocalDate(Date date) {
        return date != null ? date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : null;
    }

    default Date toDate(LocalDate localDate) {
        return localDate != null ? Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant()) : null;
    }

}
