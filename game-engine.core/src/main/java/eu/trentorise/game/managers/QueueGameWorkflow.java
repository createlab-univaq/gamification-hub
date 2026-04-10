package eu.trentorise.game.managers;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PreDestroy;

import org.slf4j.Logger;
import org.springframework.stereotype.Component;

import eu.trentorise.game.core.LogHub;

/**
 * A game workflow that manages a sequential execution queue per game.
 * Each game has its own single-thread executor, preserving intra-game action ordering
 * while allowing full concurrency across different games.
 */
@Component
public class QueueGameWorkflow extends GameWorkflow {

    private final Logger logger = org.slf4j.LoggerFactory.getLogger(QueueGameWorkflow.class);

    // One single-thread executor per game: preserves ordering within a game,
    // allows different games to execute concurrently without blocking each other
    private final ConcurrentHashMap<String, ExecutorService> executors = new ConcurrentHashMap<>();

    private ExecutorService getExecutor(String gameId) {
        return executors.computeIfAbsent(gameId, id -> Executors.newSingleThreadExecutor());
    }

    @Override
    public void apply(String gameId, String actionId, String userId, Map<String, Object> data,
            List<Object> factObjects) {
        long executionMoment = System.currentTimeMillis();
        apply(gameId, actionId, userId, executionMoment, data, factObjects);
    }

    @Override
    public void apply(String gameId, String actionId, String userId, long executionMoment,
            Map<String, Object> data, List<Object> factObjects) {
        try {
            String executionId = UUID.randomUUID().toString();
            Execution execution = new Execution(gameId, actionId, userId, executionId,
                    executionMoment, data, factObjects);
            getExecutor(gameId).execute(execution);
        } catch (Exception e) {
            LogHub.error(gameId, logger, "Exception submitting to game execution queue", e);
        }
    }

    // Gracefully shut down all per-game executors on application stop to avoid thread leaks
    @PreDestroy
    public void shutdown() {
        logger.info("Shutting down {} game execution queues", executors.size());
        executors.values().forEach(ExecutorService::shutdown);
        executors.clear();
    }

    class Execution implements Runnable {

        private final String gameId;
        private final String actionId;
        private final String userId;
        private final String executionId;
        private final long executionMoment;
        private final Map<String, Object> data;
        private final List<Object> factObjects;

        public Execution(String gameId, String actionId, String userId, String executionId,
                long executionMoment, Map<String, Object> data, List<Object> factObjects) {
            this.gameId = gameId;
            this.actionId = actionId;
            this.userId = userId;
            this.executionId = executionId;
            this.executionMoment = executionMoment;
            this.data = data;
            this.factObjects = factObjects;
        }

        public void run() {
            workflowExec(gameId, actionId, userId, executionId, executionMoment, data, factObjects);
        }
    }
}
