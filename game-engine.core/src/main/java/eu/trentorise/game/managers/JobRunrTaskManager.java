package eu.trentorise.game.managers;

import java.time.Duration;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;
import org.jobrunr.jobs.lambdas.JobLambda;
import org.jobrunr.scheduling.JobScheduler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.trentorise.game.core.GameTaskExecutor;
import eu.trentorise.game.core.LogHub;
import eu.trentorise.game.core.TaskSchedule;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.EngineTask;
import eu.trentorise.game.model.core.GameTask;

public class JobRunrTaskManager extends TaskDataManager {

    private static final String ENGINE_GROUP = "engine";

    private final Logger logger = LoggerFactory.getLogger(JobRunrTaskManager.class);

    private final JobScheduler jobScheduler;

    private final GameTaskExecutor taskExecutor;

    public JobRunrTaskManager(JobScheduler jobScheduler, GameTaskExecutor taskExecutor) {
        this.jobScheduler = jobScheduler;
        this.taskExecutor = taskExecutor;
    }

    @Override
    public void createTask(GameTask task, Game game) {
        if (task.getSchedule() == null) {
            LogHub.warn(game.getId(), logger, "Task {} has no schedule, nothing to register", task.getName());
            return;
        }
        String jobId = recurringJobId(game.getId(), game.getName(), task.getName());
        String taskName = task.getName();
        String targetGameId = game.getId();
        try {
            scheduleRecurrently(jobId, task.getSchedule(),
                    () -> taskExecutor.executeGameTask(targetGameId, taskName));
            LogHub.info(game.getId(), logger, "Registered recurring job {} for task {}", jobId, taskName);
        } catch (Exception e) {
            LogHub.error(game.getId(), logger, "Error registering recurring job {}: {}", jobId, e.getMessage());
        }
    }

    @Override
    public void updateTask(GameTask task, Game game) {
        createTask(task, game);
    }

    @Override
    public boolean destroyTask(GameTask task, Game game) {
        String jobId = recurringJobId(game.getId(), game.getName(), task.getName());
        try {
            jobScheduler.deleteRecurringJob(jobId);
            deleteData(game.getId(), task.getName());
            LogHub.info(game.getId(), logger, "Destroyed recurring job {} and its data", jobId);
            return true;
        } catch (Exception e) {
            LogHub.error(game.getId(), logger, "Error destroying recurring job {}: {}", jobId, e.getMessage());
            return false;
        }
    }

    @Override
    public void createEngineTask(EngineTask engineTask) {
        if (engineTask.getSchedule() == null) {
            LogHub.warn(null, logger, "Engine task {} has no schedule, nothing to register", engineTask.getName());
            return;
        }
        taskExecutor.registerEngineTask(engineTask);
        String taskName = engineTask.getName();
        String jobId = engineJobId(taskName);
        try {
            scheduleRecurrently(jobId, engineTask.getSchedule(), () -> taskExecutor.executeEngineTask(taskName));
            LogHub.info(null, logger, "Registered recurring job {} for engine task {}", jobId, taskName);
        } catch (Exception e) {
            LogHub.error(null, logger, "Error registering recurring job {}: {}", jobId, e.getMessage());
        }
    }

    private void scheduleRecurrently(String jobId, TaskSchedule schedule,
            JobLambda job) {
        if (schedule.getDelay() != null) {
            LogHub.warn(null, logger, "Schedule delay is not supported by the JobRunr task manager, ignoring it");
        }
        if (StringUtils.isNotBlank(schedule.getCronExpression())) {
            jobScheduler.scheduleRecurrently(jobId, toUnixCron(schedule.getCronExpression()), job);
        } else if (schedule.getPeriod() > 0) {
            jobScheduler.scheduleRecurrently(jobId, Duration.ofMillis(schedule.getPeriod()), job);
        } else {
            LogHub.warn(null, logger, "Schedule of job {} defines neither cron expression nor period, skipping",
                    jobId);
        }
    }

    public static String recurringJobId(String gameId, String gameName, String taskName) {
        return sanitizeJobId(gameId + "_" + gameName + "_" + taskName);
    }

    public static String engineJobId(String taskName) {
        return sanitizeJobId(ENGINE_GROUP + "_" + taskName);
    }

    private static String sanitizeJobId(String id) {
        return id.replaceAll("[^A-Za-z0-9_-]", "-");
    }

    public static String toUnixCron(String quartzCron) {
        String[] tokens = quartzCron.trim().split("\\s+");
        if (tokens.length < 6) {
            return quartzCron;
        }
        return Arrays.stream(tokens)
                .skip(1)
                .limit(5)
                .map(token -> "?".equals(token) ? "*" : token)
                .collect(Collectors.joining(" "));
    }

}
