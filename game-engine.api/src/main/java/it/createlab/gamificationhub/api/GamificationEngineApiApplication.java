package it.createlab.gamificationhub.api;

import it.createlab.gamificationhub.api.config.AppConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableConfigurationProperties(value = {AppConfig.class})
@EnableMongoRepositories(basePackages = "it.createlab.gamificationhub.api.model.repository")
public class GamificationEngineApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamificationEngineApiApplication.class, args);
    }

}
