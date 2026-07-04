package eu.trentorise.game.config;

import org.jobrunr.configuration.JobRunr;
import org.jobrunr.dashboard.JobRunrDashboardWebServerConfiguration;
import org.jobrunr.scheduling.JobScheduler;
import org.jobrunr.storage.InMemoryStorageProvider;
import org.jobrunr.storage.StorageProvider;
import org.jobrunr.storage.nosql.mongo.MongoDBStorageProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mongodb.client.MongoClient;

import eu.trentorise.game.core.AppContextProvider;
import eu.trentorise.game.core.Clock;
import eu.trentorise.game.core.GameTaskExecutor;
import eu.trentorise.game.core.LogHub;
import eu.trentorise.game.core.SystemClock;
import eu.trentorise.game.managers.JobRunrTaskManager;
import eu.trentorise.game.services.TaskService;

@Configuration
public class GameEngineConfiguration {

	private final Logger logger = LoggerFactory.getLogger(GameEngineConfiguration.class);

	@Value("${engine.task.persistence.activate:true}")
	private boolean taskPersistenceActive;

	@Value("${engine.task.database-name:gamification_task_store}")
	private String taskDatabaseName;

	@Value("${engine.task.dashboard.enabled:false}")
	private boolean taskDashboardEnabled;

	@Value("${engine.task.dashboard.port:8000}")
	private int taskDashboardPort;

	@Value("${engine.task.dashboard.username:}")
	private String taskDashboardUsername;

	@Value("${engine.task.dashboard.password:}")
	private String taskDashboardPassword;

	@Bean
	@ConditionalOnMissingBean
	public AppContextProvider appCtxProvider() {
		return new AppContextProvider();
	}

	@Bean
	@ConditionalOnMissingBean
	public Clock clock() {
		return new SystemClock();
	}

	@Bean
	@ConditionalOnMissingBean
	public StorageProvider jobRunrStorageProvider(MongoClient mongoClient) {
		if (taskPersistenceActive) {
			LogHub.info(null, logger, "task persistence active..using JobRunr MongoDB storage");
			return new MongoDBStorageProvider(mongoClient, taskDatabaseName);
		}
		LogHub.info(null, logger, "task persistence unactive..using JobRunr in-memory storage");
		return new InMemoryStorageProvider();
	}

	@Bean
	@ConditionalOnMissingBean
	public JobScheduler jobScheduler(StorageProvider jobRunrStorageProvider, ApplicationContext applicationContext) {
		return JobRunr.configure()
				.useStorageProvider(jobRunrStorageProvider)
				.useJobActivator(applicationContext::getBean)
				.useBackgroundJobServer()
				.useDashboardIf(taskDashboardEnabled, dashboardConfiguration())
				.initialize()
				.getJobScheduler();
	}

	@Bean
	@ConditionalOnMissingBean(name = "jobRunrShutdown")
	public DisposableBean jobRunrShutdown() {
		return JobRunr::destroy;
	}

	@Bean
	@ConditionalOnMissingBean
	public TaskService taskSrv(JobScheduler jobScheduler, GameTaskExecutor taskExecutor) {
		return new JobRunrTaskManager(jobScheduler, taskExecutor);
	}

	private JobRunrDashboardWebServerConfiguration dashboardConfiguration() {
		JobRunrDashboardWebServerConfiguration configuration = JobRunrDashboardWebServerConfiguration
				.usingStandardDashboardConfiguration()
				.andPort(taskDashboardPort);
		if (!taskDashboardUsername.isBlank() && !taskDashboardPassword.isBlank()) {
			configuration.andBasicAuthentication(taskDashboardUsername, taskDashboardPassword);
		}
		return configuration;
	}

}
