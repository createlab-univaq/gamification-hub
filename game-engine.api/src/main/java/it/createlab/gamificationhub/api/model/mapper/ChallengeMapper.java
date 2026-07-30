package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.ChallengeModel;
import it.createlab.gamificationhub.api.model.dto.ChallengeDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ChallengeMapper extends EntityMapper<ChallengeDTO, ChallengeModel> {
}
