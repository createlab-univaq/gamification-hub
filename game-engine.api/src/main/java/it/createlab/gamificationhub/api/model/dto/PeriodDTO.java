package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

@Data
public class PeriodDTO {

    private String identifier;

    private Long start;

    private Long end;

    private long period;

    private int capacity;

}
