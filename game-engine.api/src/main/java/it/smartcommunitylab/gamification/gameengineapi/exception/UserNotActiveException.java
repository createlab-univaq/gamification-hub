package it.smartcommunitylab.gamification.gameengineapi.exception;

import org.springframework.http.HttpStatus;

public class UserNotActiveException extends RequestException {


    public UserNotActiveException() {
        super("User not active!", "User is not currently active. Ask an administrator.", HttpStatus.FORBIDDEN);
    }


}
