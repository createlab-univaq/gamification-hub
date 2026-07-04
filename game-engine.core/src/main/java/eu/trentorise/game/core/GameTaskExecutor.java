package eu.trentorise.game.core;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.jobrunr.jobs.annotations.Job;
import org.jobrunr.scheduling.JobScheduler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import eu.trentorise.game.managers.JobRunrTaskManager;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.EngineTask;
import eu.trentorise.game.model.core.GameTask;
import eu.trentorise.game.repo.GamePersistence;
import eu.trentorise.game.repo.GameRepo;
import eu.trentorise.game.services.PlayerService;
import eu.trentorise.game.task.AutoChallengeChoiceTask;

@Component
public class GameTaskExecutor {

    private final Logger logger = LoggerFactory.getLogger(GameTaskExecutor.class);

    @Autowired
    private GameRepo gameRepo;

    @Autowired
    private AppContextProvider provider;

    @Autowired
    private PlayerService playerSrv;

    @Autowired
    private JobScheduler jobScheduler;

    private final Map<String, EngineTask> engineTasks = new ConcurrentHashMap<>();

    @Job(name = "Task %1 of game %0", retries = 0)
    public void executeGameTask(String gameId, String taskName) {
        GamePersistence persistedGame = gameRepo.findById(gameId).orElse(null);
        if (persistedGame == null) {
            LogHub.warn(gameId, logger,
                    "Game {} not found, the recurring job of task {} should be removed manually", gameId, taskName);
            return;
        }
        if (persistedGame.isTerminated()) {
            LogHub.warn(gameId, logger, "Game {} is terminated, removing recurring task {}", gameId, taskName);
            jobScheduler.deleteRecurringJob(
                    JobRunrTaskManager.recurringJobId(gameId, persistedGame.getName(), taskName));
            return;
        }
        Game game = persistedGame.toGame();
        GameTask task = game.getTasks().stream()
                .filter(t -> taskName.equals(t.getName()))
                .findFirst()
                .orElse(null);
        if (task == null) {
            LogHub.warn(gameId, logger, "Task {} no longer defined in game {}, removing recurring job", taskName,
                    gameId);
            jobScheduler.deleteRecurringJob(
                    JobRunrTaskManager.recurringJobId(gameId, persistedGame.getName(), taskName));
            return;
        }
        if (task instanceof AutoChallengeChoiceTask) {
            ((AutoChallengeChoiceTask) task).setPlayerSrv(playerSrv);
        }
        GameContext ctx = (GameContext) provider.getApplicationContext().getBean("gameCtx", gameId, task);
        LogHub.info(gameId, logger, "Executing task {} of game {}", taskName, gameId);
        task.execute(ctx);
    }

    @Job(name = "Engine task %0", retries = 0)
    public void executeEngineTask(String taskName) {
        EngineTask task = engineTasks.get(taskName);
        if (task == null) {
            LogHub.warn(null, logger, "Engine task {} not registered, skipping execution", taskName);
            return;
        }
        LogHub.info(null, logger, "Executing engine task {}", taskName);
        task.execute();
    }

    public void registerEngineTask(EngineTask task) {
        engineTasks.put(task.getName(), task);
    }

}
