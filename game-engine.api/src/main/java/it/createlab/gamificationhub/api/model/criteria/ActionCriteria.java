package it.createlab.gamificationhub.api.model.criteria;

import it.createlab.gamificationhub.api.model.dto.ActionDTO;
import lombok.Data;

import java.util.List;

@Data
public class ActionCriteria {

    private String name;

    public static List<ActionDTO> filter(ActionCriteria criteria, List<ActionDTO> actions) {
        return actions.stream()
                .filter(actionDTO -> criteria.name == null
                        || (actionDTO.getName() != null && actionDTO.getName().contains(criteria.name)))
                .toList();
    }

}
