package it.createlab.gamificationhub.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class PointConceptDTO {

    private String id;

    @NotBlank
    private String name;

    private double score = 0.0;

    private Map<String, PeriodDTO> periods = new HashMap<>();

}
