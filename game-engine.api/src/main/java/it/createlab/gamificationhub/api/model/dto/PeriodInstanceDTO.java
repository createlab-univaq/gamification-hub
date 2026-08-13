package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

@Data
public class PeriodInstanceDTO {

    private int index;

    private long start;

    private long end;

    private Double score;

}
