package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.GroupChallenge;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.GroupChallengeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = EntityMapper.class, uses = {AttendeeMapper.class, RewardMapper.class, TimeMapper.class})
public interface GroupChallengeMapper extends EntityMapper<GroupChallengeDTO, GroupChallenge> {

    @Override
    @Mapping(target = "pointConceptName", source = "challengePointConcept.name")
    @Mapping(target = "periodName", source = "challengePointConcept.period")
    GroupChallengeDTO toDTO(GroupChallenge groupChallenge);

}
