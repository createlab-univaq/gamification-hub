package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.TeamDTO;

import java.util.List;

public interface TeamService {

    List<TeamDTO> getTeams(String gameId);

    TeamDTO getTeam(String gameId, String teamId);

    TeamDTO create(TeamDTO team);

    TeamDTO update(TeamDTO team);

    void delete(String gameId, String teamId);

}
