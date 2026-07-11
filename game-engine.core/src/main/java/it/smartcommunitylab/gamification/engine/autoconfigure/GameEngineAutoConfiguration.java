package it.smartcommunitylab.gamification.engine.autoconfigure;

import eu.trentorise.game.config.AppConfig;
import eu.trentorise.game.config.MongoConfig;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@AutoConfiguration(afterName = "org.springframework.boot.mongodb.autoconfigure.MongoAutoConfiguration")
@ComponentScan(
        basePackages = "eu.trentorise.game",
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                        MongoConfig.class,
                        AppConfig.class
                })
        }
)
@EnableMongoRepositories(basePackages = "eu.trentorise.game.repo")
public class GameEngineAutoConfiguration {

    public GameEngineAutoConfiguration() {
        System.setProperty("drools.parallelRulesBuildThreshold", "-1");
    }

}
