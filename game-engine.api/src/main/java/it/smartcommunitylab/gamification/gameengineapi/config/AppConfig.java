package it.smartcommunitylab.gamification.gameengineapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;

@Component
@ConfigurationProperties("custom")
@Data
public class AppConfig {

    private JwtProperties jwt = new JwtProperties();

    private CorsConfiguration cors = new CorsConfiguration();

    @Data
    public static class JwtProperties {
        private String jwtSecret;
        private Long expiration;
    }

}
