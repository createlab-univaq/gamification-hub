package it.createlab.gamificationhub.api.model.criteria;

import it.createlab.gamificationhub.api.model.dto.PointConceptDTO;
import lombok.Data;

import java.util.List;

@Data
public class PointConceptCriteria {

    private String id;

    private String name;

    public static List<PointConceptDTO> filter(PointConceptCriteria criteria, List<PointConceptDTO> points) {
        return points.stream()
                .filter(pointConceptDTO -> {
                    if (criteria.id != null && !criteria.id.equals(pointConceptDTO.getId())) {
                        return false;
                    }
                    return criteria.name == null
                            || (pointConceptDTO.getName() != null && pointConceptDTO.getName().contains(criteria.name));
                })
                .toList();
    }

}
