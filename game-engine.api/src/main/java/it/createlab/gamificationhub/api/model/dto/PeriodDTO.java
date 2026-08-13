package it.createlab.gamificationhub.api.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PeriodDTO {

    private String identifier;

    @NotNull
    private Long start;

    private Long end;

    private long period;

    private int capacity;

    private List<PeriodInstanceDTO> instances = new ArrayList<>();

}
