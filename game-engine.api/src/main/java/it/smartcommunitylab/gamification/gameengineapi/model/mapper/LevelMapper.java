package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.Level;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.LevelDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ThresholdConfigDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ThresholdDTO;
import org.mapstruct.Mapper;

@Mapper(config = EntityMapper.class)
public interface LevelMapper extends EntityMapper<LevelDTO, Level> {

    ThresholdDTO toThresholdDTO(Level.Threshold threshold);

    ThresholdConfigDTO toThresholdConfigDTO(Level.Config config);

    default Level.Threshold toThreshold(ThresholdDTO dto) {
        if (dto == null) {
            return null;
        }
        Level.Threshold threshold = new Level.Threshold(dto.getName(), dto.getValue());
        threshold.setIndex(dto.getIndex());
        threshold.setConfig(toConfig(dto.getConfig()));
        return threshold;
    }

    default Level.Config toConfig(ThresholdConfigDTO dto) {
        if (dto == null) {
            return null;
        }
        Level.Config config = new Level.Config();
        config.setChoices(dto.getChoices());
        if (dto.getActiveModels() != null) {
            config.setActiveModels(dto.getActiveModels());
        }
        if (dto.getAvailableModels() != null) {
            config.getAvailableModels().addAll(dto.getAvailableModels());
        }
        return config;
    }

}
