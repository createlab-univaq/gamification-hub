package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RuleValidateRequestDTO {

    @JsonProperty("rule")
    private String content;

}
