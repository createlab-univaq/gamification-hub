package it.smartcommunitylab.gamification.gameengineapi.exception;

import org.springframework.http.HttpStatus;

public class EntityNotFoundException extends RequestException {

    public EntityNotFoundException(String entityName, Object id) {
        super("Entity %s not found".formatted(entityName), "Value with id: %s not found.".formatted(id), HttpStatus.NOT_FOUND);
    }

    public EntityNotFoundException(Object id) {
        super("Entity not found", "Value with id: %s not found.".formatted(id), HttpStatus.NOT_FOUND);
    }

}
