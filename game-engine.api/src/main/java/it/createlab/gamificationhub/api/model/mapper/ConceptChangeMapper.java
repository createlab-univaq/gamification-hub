package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.simulation.ConceptChange;
import it.createlab.gamificationhub.api.model.dto.simulation.ConceptChangeDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ConceptChangeMapper extends EntityMapper<ConceptChangeDTO, ConceptChange> {
}
