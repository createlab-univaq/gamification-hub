package it.smartcommunitylab.gamification.gameengineapi.exception;

import org.springframework.http.HttpStatus;

public class UserNotAuthorizedException extends RequestException {

    public UserNotAuthorizedException() {
        super("User not authorized.", "User is not authorized to access this resource", HttpStatus.UNAUTHORIZED);
    }

}
