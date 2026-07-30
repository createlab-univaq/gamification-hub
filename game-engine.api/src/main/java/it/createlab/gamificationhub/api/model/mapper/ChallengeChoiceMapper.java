package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.ChallengeChoice;
import it.createlab.gamificationhub.api.model.dto.ChallengeChoiceDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ChallengeChoiceMapper extends EntityMapper<ChallengeChoiceDTO, ChallengeChoice> {
}
