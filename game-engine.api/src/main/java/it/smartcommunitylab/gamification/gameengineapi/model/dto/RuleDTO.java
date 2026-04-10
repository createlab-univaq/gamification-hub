package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RuleDTO {
    private String id;
    @NotBlank
    private String gameId;
    @NotBlank
    private String name;
    @NotBlank
    private String content;
}
