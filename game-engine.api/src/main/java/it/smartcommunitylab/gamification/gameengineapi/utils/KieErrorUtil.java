package it.smartcommunitylab.gamification.gameengineapi.utils;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.ValidationMessageDTO;
import org.kie.api.builder.Message;

import java.util.HashMap;
import java.util.Map;

public class KieErrorUtil {

    private KieErrorUtil() {}

    public static Map<String, Message> parseErrors(Map<String, Message> logs) {
        Map<String, Message> parsedErrors = new HashMap<>();
        logs.forEach((key, message)->{
            // Optimistic filtering
            // A message longer than 200 characters is some eldritch abomination incomprehensible to our human mind
            if(message.getText().length() <= 200) {
                parsedErrors.put(key, message);
            }
        });
        return parsedErrors;
    }

}
