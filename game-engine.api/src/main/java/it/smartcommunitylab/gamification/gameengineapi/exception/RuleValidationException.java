package it.smartcommunitylab.gamification.gameengineapi.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@Getter
public class RuleValidationException extends RequestException {

    private Map<String, Object> errors = new HashMap<>();

    public RuleValidationException(String title, String message, Map<String, Object> errors) {
        super(title, message, HttpStatus.BAD_REQUEST);
        this.errors = errors;
    }

    public RuleValidationException(Map<String, Object> errors) {
        this("Rule Validation Failed", "One or more errors were raised during validation", errors);
    }


}
