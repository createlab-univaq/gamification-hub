package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TestEntityDTO {

    private String id;

    @NotBlank
    private String value;

}
