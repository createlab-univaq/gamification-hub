package it.smartcommunitylab.gamification.gameengineapi.service;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.UserDTO;

public interface AuthenticationService {

    String createToken(String username, String password);

    UserDTO getAuthUser();

}
