package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.TestEntityDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.entity.TestEntity;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface TestMapper extends EntityMapper<TestEntityDTO, TestEntity> {
}
