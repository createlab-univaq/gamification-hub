package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.UserDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.entity.User;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface UserMapper extends EntityMapper<UserDTO, User> {
}
