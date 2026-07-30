package it.createlab.gamificationhub.api.service;

import it.createlab.gamificationhub.api.model.dto.LoginRequestDTO;
import it.createlab.gamificationhub.api.model.dto.UserDTO;

public interface AuthenticationService {

    String createToken(String username, String password);

    UserDTO getAuthUser();

    UserDTO registerUser(String username, String password);

    void deactivateUser(String userId);

    UserDTO updateUser(LoginRequestDTO requestDTO);

}
