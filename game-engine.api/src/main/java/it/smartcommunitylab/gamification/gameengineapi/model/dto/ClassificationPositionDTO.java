package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationPositionDTO {

    private int position;

    private String playerId;

    private double score;

}
