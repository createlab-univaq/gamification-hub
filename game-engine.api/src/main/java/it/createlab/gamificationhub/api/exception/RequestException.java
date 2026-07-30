package it.createlab.gamificationhub.api.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class RequestException extends RuntimeException {

    private String title;
    private String code;
    private List<Object> params = new ArrayList<>();
    private HttpStatus status;

    public RequestException() {
        this("Generic Error", "Something went truly wrong...", ErrorCodes.GENERIC, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public RequestException(HttpStatus status) {
        this("Generic Error", "Something went truly wrong...", ErrorCodes.GENERIC, status);
    }

    public RequestException(String title, String message, HttpStatus status) {
        super(message);
        this.title = title;
        this.status = status;
        this.code = ErrorCodes.GENERIC;
        this.params = new ArrayList<>();
    }

    public RequestException(String title, String message, String code, HttpStatus status) {
        super(message);
        this.title = title;
        this.status = status;
        this.code = code;
        this.params = new ArrayList<>();
    }

    public RequestException(String title, String message, String code, List<Object> params, HttpStatus status) {
        super(message);
        this.title = title;
        this.status = status;
        this.code = code;
        this.params = new ArrayList<>(params);
    }


    public String toString(){
        return "%s (%d): %s".formatted(this.title, this.status.value(), getMessage());
    }

}
