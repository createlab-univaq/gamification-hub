package it.smartcommunitylab.gamification.gameengineapi.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kie.api.builder.Message;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationMessageDTO implements Serializable {

    private Long id;

    private String text;

    private Message.Level level;

}
