package it.createlab.gamificationhub.api.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PeriodDTO {

    private String identifier;

    @NotNull
    private Long start;

    private Long end;

    private long period;

    private int capacity;

}
