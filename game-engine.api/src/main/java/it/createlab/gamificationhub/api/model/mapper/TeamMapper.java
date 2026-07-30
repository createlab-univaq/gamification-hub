package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.TeamState;
import it.createlab.gamificationhub.api.model.dto.TeamDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ObjectFactory;

@Mapper(config = EntityMapper.class)
public interface TeamMapper extends EntityMapper<TeamDTO, TeamState> {

    @ObjectFactory
    default TeamState createTeam(TeamDTO dto) {
        return new TeamState(dto.getGameId(), dto.getId());
    }

    @Override
    @Mapping(target = "playerId", source = "id")
    TeamState toEntity(TeamDTO dto);

    @Override
    @Mapping(target = "id", source = "playerId")
    TeamDTO toDTO(TeamState entity);

}
