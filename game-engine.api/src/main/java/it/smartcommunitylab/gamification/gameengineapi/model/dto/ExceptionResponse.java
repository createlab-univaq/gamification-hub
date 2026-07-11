package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExceptionResponse {
    private String title;
    private String message;
    private Instant timestamp;
    private Map<String, Object> details = null;
    private String errorCode;
    private List<Object> params = new ArrayList<>();

    public ExceptionResponse(String title) {
        this(title, "", Instant.now(), null, "", List.of());
    }

    public ExceptionResponse(String title, String content) {
        this(title, content, Instant.now(), null, "", List.of());
    }

    public ExceptionResponse(String title, String content, Map<String, Object> details) {
        this(title, content, Instant.now(), details, "", List.of());
    }

    public ExceptionResponse(String title, String content, Map<String, Object> details, String errorCode, List<Object> params) {
        this(title, content, Instant.now(), details, errorCode, params);
    }

}
