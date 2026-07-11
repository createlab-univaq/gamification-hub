package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.ChallengeChoice;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ChallengeChoiceDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface ChallengeChoiceMapper extends EntityMapper<ChallengeChoiceDTO, ChallengeChoice> {
}
