package it.createlab.gamificationhub.api.exception;

import org.springframework.http.HttpStatus;

import java.util.List;

public class EntityCreationException extends RequestException{

    public EntityCreationException(String entityName, String message) {
        super("Entity of type %s could not be created".formatted(entityName), message, HttpStatus.BAD_REQUEST);
    }

    public EntityCreationException(String entityName, String message, String code) {
        super("Entity of type %s could not be created".formatted(entityName), message, code, HttpStatus.BAD_REQUEST);
    }

    public EntityCreationException(String entityName, String message, String code, List<Object> params) {
        super("Entity of type %s could not be created".formatted(entityName), message, code, params,
                HttpStatus.BAD_REQUEST);
    }

}
