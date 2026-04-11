package it.smartcommunitylab.gamification.gameengineapi;

import it.smartcommunitylab.gamification.gameengineapi.config.AppConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(value = {AppConfig.class})
public class GamificationEngineApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamificationEngineApiApplication.class, args);
    }

}
