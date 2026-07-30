package it.createlab.gamificationhub.api.exception;

import org.springframework.http.HttpStatus;

public class UserNotAuthorizedException extends RequestException {

    public UserNotAuthorizedException() {
        super("User not authorized.", "User is not authorized to access this resource", ErrorCodes.USER_NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

}
