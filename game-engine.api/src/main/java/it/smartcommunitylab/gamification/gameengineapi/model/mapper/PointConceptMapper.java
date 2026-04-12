package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.PointConcept;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PointConceptDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ObjectFactory;

@Mapper(config = EntityMapper.class)
public interface PointConceptMapper extends EntityMapper<PointConceptDTO, PointConcept> {

    @ObjectFactory
    default PointConcept create(PointConceptDTO pointConceptDTO) {
        return new PointConcept(pointConceptDTO.getName());
    }

}
