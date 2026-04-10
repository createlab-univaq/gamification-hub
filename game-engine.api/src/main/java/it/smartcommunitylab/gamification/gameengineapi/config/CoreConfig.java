package it.smartcommunitylab.gamification.gameengineapi.config;

import eu.trentorise.game.config.AppConfig;
import eu.trentorise.game.config.MongoConfig;
import eu.trentorise.game.core.AppContextProvider;
import eu.trentorise.game.core.Clock;
import eu.trentorise.game.core.SystemClock;
import eu.trentorise.game.managers.DBPlayerManager;
import eu.trentorise.game.managers.QuartzTaskManager;
import eu.trentorise.game.managers.QueueGameWorkflow;
import eu.trentorise.game.services.PlayerService;
import eu.trentorise.game.services.TaskService;
import eu.trentorise.game.services.Workflow;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.impl.StdSchedulerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@ComponentScan(
        basePackages = "eu.trentorise.game",
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                        MongoConfig.class,
                        AppConfig.class
                })
        }
)
@EnableMongoRepositories(basePackages = {
        "eu.trentorise.game.repo",
        "it.smartcommunitylab.gamification.gameengineapi.model.repository"
})
@EnableScheduling
@PropertySource("classpath:engine.api.properties")
public class CoreConfig {

    private static final Logger logger = LoggerFactory.getLogger(CoreConfig.class);

    @Bean
    public AppContextProvider appCtxProvider() {
        return new AppContextProvider();
    }

    @Bean
    public Clock clock() {
        return new SystemClock();
    }

    @Bean
    public PlayerService playerSrv() {
        return new DBPlayerManager();
    }

    @Bean
    public TaskService taskSrv() {
        return new QuartzTaskManager();
    }

    @Bean
    public Workflow workflow() {
        return new QueueGameWorkflow();
    }

    @Bean
    public Scheduler quartzScheduler() {
        try {
            return new StdSchedulerFactory().getScheduler();
        } catch (SchedulerException e) {
            logger.error("Error creating Quartz scheduler", e);
            return null;
        }
    }

    @Bean
    public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
        return new ThreadPoolTaskScheduler();
    }
}
