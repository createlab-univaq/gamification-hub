package it.createlab.gamificationhub.api.model.dto;

import it.createlab.gamificationhub.api.common.Origins;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class LoginRequestDTO {

    @NotBlank
    private String username;
    @NotBlank
    @ToString.Exclude
    private String password;
    @NotNull
    private Origins origin;

}
