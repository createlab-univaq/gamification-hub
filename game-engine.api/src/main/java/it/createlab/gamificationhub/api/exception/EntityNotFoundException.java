package it.createlab.gamificationhub.api.exception;

import org.springframework.http.HttpStatus;

import java.util.List;

public class EntityNotFoundException extends RequestException {

    public EntityNotFoundException(String entityName, Object id) {
        super("Entity %s not found".formatted(entityName), "Value with id: %s not found.".formatted(id), HttpStatus.NOT_FOUND);
    }

    public EntityNotFoundException(String entityName, Object id, String code) {
        super("Entity %s not found".formatted(entityName), "Value with id: %s not found.".formatted(id), code, List.<Object>of(String.valueOf(id)), HttpStatus.NOT_FOUND);
    }

    public EntityNotFoundException(Object id) {
        super("Entity not found", "Value with id: %s not found.".formatted(id), HttpStatus.NOT_FOUND);
    }

}
