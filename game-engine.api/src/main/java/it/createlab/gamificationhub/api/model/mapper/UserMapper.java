package it.createlab.gamificationhub.api.model.mapper;

import it.createlab.gamificationhub.api.model.dto.UserDTO;
import it.createlab.gamificationhub.api.model.entity.User;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface UserMapper extends EntityMapper<UserDTO, User> {
}
