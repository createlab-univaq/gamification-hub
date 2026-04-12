package it.smartcommunitylab.gamification.gameengineapi.exception;

import org.springframework.http.HttpStatus;

public class EntityCreationException extends RequestException{

    public EntityCreationException(String entityName, String message) {
        super("Entity of type %s could not be created".formatted(entityName), message, HttpStatus.BAD_REQUEST);
    }

}
