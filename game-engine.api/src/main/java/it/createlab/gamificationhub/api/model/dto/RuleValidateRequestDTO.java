package it.createlab.gamificationhub.api.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RuleValidateRequestDTO {

    @JsonProperty("rule")
    private String content;

}
