package it.smartcommunitylab.gamification.gameengineapi.exception;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.ValidationMessageDTO;
import lombok.Getter;
import org.kie.api.builder.Message;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
public class RuleValidationException extends RequestException {

    private Map<String, ValidationMessageDTO> errors = new HashMap<>();

    public RuleValidationException(String title, String message, List<ValidationMessageDTO> errorList) {
        super(title, message, HttpStatus.BAD_REQUEST);
        errorList.forEach(e->{
            errors.put(e.getId().toString(), e);
        });
    }

    public RuleValidationException(List<ValidationMessageDTO> errors) {
        this("Rule Validation Failed", "One or more errors were raised during validation", errors);
    }


}
