package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.Reward;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.RewardDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = EntityMapper.class)
public interface RewardMapper extends EntityMapper<RewardDTO, Reward> {

    @Override
    @Mapping(target = "calculationPointConceptName", source = "calculationPointConcept.name")
    @Mapping(target = "calculationPeriodName", source = "calculationPointConcept.period")
    @Mapping(target = "targetPointConceptName", source = "targetPointConcept.name")
    @Mapping(target = "targetPeriodName", source = "targetPointConcept.period")
    RewardDTO toDTO(Reward reward);

    @Override
    @Mapping(target = "calculationPointConcept.name", source = "calculationPointConceptName")
    @Mapping(target = "calculationPointConcept.period", source = "calculationPeriodName")
    @Mapping(target = "targetPointConcept.name", source = "targetPointConceptName")
    @Mapping(target = "targetPointConcept.period", source = "targetPeriodName")
    Reward toEntity(RewardDTO dto);

}
