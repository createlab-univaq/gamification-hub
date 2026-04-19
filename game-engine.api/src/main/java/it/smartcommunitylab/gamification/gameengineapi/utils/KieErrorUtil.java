package it.smartcommunitylab.gamification.gameengineapi.utils;

import org.kie.api.builder.Message;

import java.util.HashMap;
import java.util.Map;

public class KieErrorUtil {

    private KieErrorUtil() {}

    public static Map<String, Object> parseErrors(Map<String, Message> logs) {
        Map<String, Object> parsedErrors = new HashMap<>();
        logs.forEach((key, message)->{
            // Optimistic filtering
            // A message longer than 100 characters is some eldritch abomination incomprehensible to our human mind
            if(message.getLevel() == Message.Level.ERROR && message.getText().length() <= 100) {
                String errorMessage = "Line %d: %s".formatted(message.getLine(), message.getText());
                parsedErrors.put(key, errorMessage);
            }
        });
        return parsedErrors;
    }

}
