package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.PointConcept;
import it.createlab.gamificationhub.api.model.dto.PeriodDTO;
import it.createlab.gamificationhub.api.model.dto.PointConceptDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ObjectFactory;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Mapper(config = EntityMapper.class)
public interface PointConceptMapper extends EntityMapper<PointConceptDTO, PointConcept> {

    @ObjectFactory
    default PointConcept create(PointConceptDTO dto) {
        Map<String, Object> jsonProps = new HashMap<>();
        jsonProps.put("id", dto.getId());
        jsonProps.put("name", dto.getName());
        jsonProps.put("score", dto.getScore());
        if (dto.getPeriods() != null) {
            Map<String, Object> periods = new HashMap<>();
            dto.getPeriods().forEach((key, p) -> {
                Map<String, Object> period = new HashMap<>();
                period.put("identifier", p.getIdentifier() != null ? p.getIdentifier() : key);
                period.put("start", p.getStart());
                period.put("end", p.getEnd());
                period.put("period", p.getPeriod());
                period.put("capacity", p.getCapacity());
                periods.put(key, period);
            });
            jsonProps.put("periods", periods);
        }
        return new PointConcept(jsonProps);
    }

    @Override
    @Mapping(target = "periods", ignore = true)
    PointConcept toEntity(PointConceptDTO dto);

    @Override
    @Mapping(target = "periods", ignore = true)
    void updateEntity(@MappingTarget PointConcept entity, PointConceptDTO dto);

    @AfterMapping
    default void updatePeriods(@MappingTarget PointConcept entity, PointConceptDTO dto) {
        entity.setPeriods(create(dto).getPeriods());
    }

    default Map<String, PeriodDTO> periodsToDto(Map<String, ? extends PointConcept.Period> periods) {
        if (periods == null) {
            return null;
        }
        Map<String, PeriodDTO> result = new HashMap<>();
        periods.forEach((key, p) -> {
            PeriodDTO dto = new PeriodDTO();
            dto.setIdentifier(p.getIdentifier());
            dto.setStart(p.getStart() != null ? p.getStart().getTime() : null);
            dto.setEnd(p.getEnd().map(Date::getTime).orElse(null));
            dto.setPeriod(p.getPeriod());
            dto.setCapacity(p.getCapacity());
            result.put(key, dto);
        });
        return result;
    }

}
