package it.createlab.gamificationhub.api.exception;

import org.springframework.http.HttpStatus;

public class UserNotActiveException extends RequestException {


    public UserNotActiveException() {
        super("User not active!", "User is not currently active. Ask an administrator.", ErrorCodes.USER_NOT_ACTIVE, HttpStatus.FORBIDDEN);
    }


}
