package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.ScenarioCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.SimulationScenarioDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.entity.SimulationScenario;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ScenarioMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.repository.SimulationScenarioRepository;
import it.smartcommunitylab.gamification.gameengineapi.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScenarioServiceImpl implements ScenarioService {

    private final SimulationScenarioRepository repository;
    private final ScenarioMapper scenarioMapper;

    @Override
    public List<SimulationScenarioDTO> get(ScenarioCriteria criteria) {
        SimulationScenario probe = new SimulationScenario();
        probe.setId(criteria.getId());
        probe.setGameId(criteria.getGameId());
        probe.setName(criteria.getName());

        ExampleMatcher matcher = ExampleMatcher.matchingAll()
                .withIgnorePaths("createdAt", "updatedAt")
                .withMatcher("name", match -> match.contains().ignoreCase());

        return repository.findAll(Example.of(probe, matcher)).stream()
                .map(scenarioMapper::toDTO)
                .toList();
    }

    @Override
    public SimulationScenarioDTO get(String id) {
        return scenarioMapper.toDTO(repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Scenario", id, ErrorCodes.SCENARIO_NOT_FOUND)));
    }

    @Override
    public SimulationScenarioDTO create(SimulationScenarioDTO scenarioDTO) {
        if (repository.findByGameIdAndName(scenarioDTO.getGameId(), scenarioDTO.getName()).isPresent()) {
            throw new EntityCreationException("Scenario",
                    "A scenario named %s already exists in game %s".formatted(scenarioDTO.getName(), scenarioDTO.getGameId()), ErrorCodes.SCENARIO_CREATION);
        }
        SimulationScenario entity = scenarioMapper.toEntity(scenarioDTO);
        entity.setId(null);
        return scenarioMapper.toDTO(repository.save(entity));
    }

    @Override
    public SimulationScenarioDTO update(SimulationScenarioDTO scenarioDTO) {
        SimulationScenario existing = repository.findById(scenarioDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("Scenario", scenarioDTO.getId(), ErrorCodes.SCENARIO_NOT_FOUND));
        scenarioMapper.updateEntity(existing, scenarioDTO);
        return scenarioMapper.toDTO(repository.save(existing));
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

}
