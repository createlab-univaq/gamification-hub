package it.createlab.gamificationhub.api.model.criteria;

import it.createlab.gamificationhub.api.model.dto.LevelDTO;
import lombok.Data;

import java.util.List;

@Data
public class LevelCriteria {

    private String name;

    private String pointConceptName;

    public static List<LevelDTO> filter(LevelCriteria criteria, List<LevelDTO> levels) {
        return levels.stream()
                .filter(levelDTO -> {
                    if (criteria.name != null
                            && (levelDTO.getName() == null || !levelDTO.getName().contains(criteria.name))) {
                        return false;
                    }
                    return criteria.pointConceptName == null
                            || (levelDTO.getPointConceptName() != null
                            && levelDTO.getPointConceptName().contains(criteria.pointConceptName));
                })
                .toList();
    }

}
