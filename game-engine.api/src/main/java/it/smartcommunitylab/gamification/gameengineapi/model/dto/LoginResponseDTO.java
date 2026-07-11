package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO implements Serializable {

    @NotNull
    private UserDTO user;

    @ToString.Exclude
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String token;

}
