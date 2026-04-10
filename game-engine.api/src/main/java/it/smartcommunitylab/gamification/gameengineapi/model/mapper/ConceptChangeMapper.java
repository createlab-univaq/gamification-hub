package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.simulation.ConceptChange;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ConceptChangeDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ConceptChangeMapper extends EntityMapper<ConceptChangeDTO, ConceptChange> {
}
