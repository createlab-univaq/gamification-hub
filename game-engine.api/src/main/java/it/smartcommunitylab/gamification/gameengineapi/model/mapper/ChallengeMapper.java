package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.ChallengeModel;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ChallengeMapper extends EntityMapper<ChallengeDTO, ChallengeModel> {
}
