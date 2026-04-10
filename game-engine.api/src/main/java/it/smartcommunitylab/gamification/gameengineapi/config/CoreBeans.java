package it.smartcommunitylab.gamification.gameengineapi.config;

import eu.trentorise.game.managers.DroolsEngine;
import eu.trentorise.game.services.GameEngine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CoreBeans {
    @Bean
    public GameEngine gameEngine() {
        return new DroolsEngine();
    }

}
