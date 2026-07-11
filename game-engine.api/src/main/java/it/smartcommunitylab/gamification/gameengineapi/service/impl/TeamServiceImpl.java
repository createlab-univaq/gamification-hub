package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.model.TeamState;
import eu.trentorise.game.repo.PlayerRepo;
import eu.trentorise.game.repo.StatePersistence;
import eu.trentorise.game.services.PlayerService;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.TeamDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.TeamMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final PlayerService playerService;
    private final PlayerRepo playerRepo;
    private final TeamMapper teamMapper;

    @Override
    public List<TeamDTO> getTeams(String gameId) {
        return playerService.readTeams(gameId).stream()
                .map(teamMapper::toDTO)
                .toList();
    }

    @Override
    public TeamDTO getTeam(String gameId, String teamId) {
        TeamState team = playerService.readTeam(gameId, teamId);
        if (team == null) {
            throw new EntityNotFoundException("Team", teamId, ErrorCodes.TEAM_NOT_FOUND);
        }
        return teamMapper.toDTO(team);
    }

    @Override
    public TeamDTO create(TeamDTO team) {
        if (playerService.readTeam(team.getGameId(), team.getId()) != null) {
            throw new EntityCreationException("Team", "A team with this id already exists", ErrorCodes.TEAM_CREATION);
        }
        validateMembers(team.getGameId(), team.getMembers());
        team.setName(team.getId());
        TeamState saved = playerService.saveTeam(teamMapper.toEntity(team));
        return teamMapper.toDTO(saved);
    }

    @Override
    public TeamDTO update(TeamDTO team) {
        TeamState existing = playerService.readTeam(team.getGameId(), team.getId());
        if (existing == null) {
            throw new EntityNotFoundException("Team", team.getId(), ErrorCodes.TEAM_NOT_FOUND);
        }
        validateMembers(team.getGameId(), team.getMembers());
        existing.setMembers(team.getMembers());
        return teamMapper.toDTO(playerService.saveTeam(existing));
    }

    @Override
    public void delete(String gameId, String teamId) {
        playerService.deleteState(gameId, teamId);
    }

    private void validateMembers(String gameId, List<String> members) {
        if (members == null || members.isEmpty()) {
            return;
        }
        Set<String> existing = playerRepo.findByGameIdAndPlayerIdIn(gameId, members).stream()
                .map(StatePersistence::getPlayerId)
                .collect(Collectors.toSet());
        List<String> missing = members.stream()
                .filter(member -> !existing.contains(member))
                .toList();
        if (!missing.isEmpty()) {
            throw new RequestException("Invalid team members",
                    "These players do not exist: " + String.join(", ", missing),
                    ErrorCodes.INVALID_TEAM_MEMBERS,
                    HttpStatus.BAD_REQUEST);
        }
    }

}
