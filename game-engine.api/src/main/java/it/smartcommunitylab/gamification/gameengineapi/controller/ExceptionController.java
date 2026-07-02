package it.smartcommunitylab.gamification.gameengineapi.controller;

import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.exception.RuleValidationException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ExceptionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class ExceptionController {

    private ResponseEntity<ExceptionResponse> buildResponseObject(String title, String content, String code, List<Object> params, Map<String, Object> details, HttpStatus status) {
        ExceptionResponse exceptionResponse = new ExceptionResponse(title, content, details, code, params);
        return ResponseEntity.status(status).body(exceptionResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionResponse> handleValidationException(MethodArgumentNotValidException e) {
        log.error("Validation error!\n{}", e.getMessage());
        Map<String, Object> details = new HashMap<>();
        e.getFieldErrors().forEach(fieldError -> {
            details.put(fieldError.getField(), fieldError.getDefaultMessage());
        });
        return buildResponseObject("Validation Error!", "One or more values are not correct.", ErrorCodes.VALIDATION, List.of(), details, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuleValidationException.class)
    public ResponseEntity<ExceptionResponse> handleValidationException(RuleValidationException e) {
        log.error("Validation error!\n{}\nError List={}", e.getMessage(), e.getErrors());
        Map<String, Object> details = new HashMap<>(e.getErrors());
        return buildResponseObject(e.getTitle(), e.getMessage(), e.getCode(), e.getParams(), details, e.getStatus());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ExceptionResponse> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("User authentication failed. Bad Credentials");
        return buildResponseObject("Authentication failed", "Username or password incorrect", ErrorCodes.AUTHENTICATION_FAILED, List.of(), null, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(RequestException.class)
    public ResponseEntity<ExceptionResponse> handleResponseException(RequestException e) {
        log.error("Response Error!\n{}", e.toString());
        e.printStackTrace();
        return buildResponseObject(e.getTitle(), e.getMessage(), e.getCode(), e.getParams(), null, e.getStatus());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ExceptionResponse> handleMongoException(DataAccessException e) {
        log.error("Mongo Error!\n{}", e.getLocalizedMessage());
        String message = e.getMessage();
        String code = ErrorCodes.DATA_ACCESS;
        if(e instanceof DuplicateKeyException dke) {
            message = "Duplicated value found!";
            code = ErrorCodes.DUPLICATE_KEY;
        }
        return buildResponseObject("Data Access Error", message, code, List.of(), null, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleGenericException(Exception e) {
        e.printStackTrace();
        log.error("Generic Error! type={}\n{}", e.getClass().getName(), e.getLocalizedMessage());
        return buildResponseObject("Generic Error", "Something went truly wrong...", ErrorCodes.GENERIC, List.of(), null, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
