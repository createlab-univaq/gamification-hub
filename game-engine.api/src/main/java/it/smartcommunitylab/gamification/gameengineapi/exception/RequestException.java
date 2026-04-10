package it.smartcommunitylab.gamification.gameengineapi.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.http.HttpStatus;

@EqualsAndHashCode(callSuper = true)
@Data
public class RequestException extends RuntimeException {

    private String title;
    private HttpStatus status;

    public RequestException() {
        this("Generic Error", "Something went truly wrong...", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public RequestException(HttpStatus status) {
        this("Generic Error", "Something went truly wrong...", status);
    }

    public RequestException(String title, String message, HttpStatus status) {
        super(message);
        this.title = title;
        this.status = status;
    }

    public String toString(){
        return "%s (%d): %s".formatted(this.title, this.status.value(), getMessage());
    }

}
