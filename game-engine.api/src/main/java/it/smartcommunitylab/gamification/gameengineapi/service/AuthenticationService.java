package it.smartcommunitylab.gamification.gameengineapi.service;

public interface AuthenticationService {

    String createToken(String username, String password);

}
