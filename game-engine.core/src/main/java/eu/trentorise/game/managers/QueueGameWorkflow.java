package eu.trentorise.game.managers;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import eu.trentorise.game.core.EngineMetrics;
import eu.trentorise.game.core.ExecutionGuard;
import eu.trentorise.game.core.LogHub;
import eu.trentorise.game.core.RuleExecutionLimitException;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.simulation.SimulationResult;

/**
 * A game workflow that manages a sequential execution queue per game.
 * Each game has its own single-thread executor, preserving intra-game action ordering
 * while allowing full concurrency across different games.
 */
@Component
public class QueueGameWorkflow extends GameWorkflow implements InitializingBean, DisposableBean {

    private final Logger logger = org.slf4j.LoggerFactory.getLogger(QueueGameWorkflow.class);

    // grace beyond the guard's own time budget: lets Layer 1 abort (and tag the real reason)
    // win the race, so a single runaway is never counted as both a firing/time trip and a timeout
    private static final long TIMEOUT_GRACE_MS = 5000;

    @Value("${engine.execution.timeout:120000}")
    private long executionTimeoutMs;

    @Value("${engine.execution.simulation-pool-size:4}")
    private int simulationPoolSize;

    // One single-thread executor per game: preserves ordering within a game,
    // allows different games to execute concurrently without blocking each other
    private final ConcurrentHashMap<String, ExecutorService> executors = new ConcurrentHashMap<>();

    // Shared bounded pool for simulations: fail-fast when saturated
    private ExecutorService simulationPool;

    @Override
    public void afterPropertiesSet() {
        simulationPool = new ThreadPoolExecutor(simulationPoolSize, simulationPoolSize,
                0L, TimeUnit.MILLISECONDS, new SynchronousQueue<>(),
                new ThreadPoolExecutor.AbortPolicy());
    }

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

    @Override
    public void applySync(String gameId, String actionId, String userId, long executionMoment,
            Map<String, Object> data, List<Object> factObjects) {
        String executionId = UUID.randomUUID().toString();
        Execution execution = new Execution(gameId, actionId, userId, executionId,
                executionMoment, data, factObjects);
        ExecutorService executor = getExecutor(gameId);
        Future<?> future = executor.submit(execution);
        awaitBoundedExecution(future, () -> {
            recoverGame(gameId, executor);
            EngineMetrics.emitAbortedExecution(ExecutionGuard.REASON_TIMEOUT, "execution");
        }, String.format("execution for game %s player %s aborted after %dms",
                gameId, userId, executionTimeoutMs));
    }

    @Override
    public SimulationResult simulate(String gameId, PlayerState syntheticState,
            Map<String, Object> data, long executionMoment, List<String> actions,
            boolean showDetailedChanges) {
        Future<SimulationResult> future;
        try {
            future = simulationPool.submit(() -> super.simulate(gameId, syntheticState, data,
                    executionMoment, actions, showDetailedChanges));
        } catch (RejectedExecutionException e) {
            throw new RuleExecutionLimitException("simulation engine busy, retry later");
        }
        return awaitBoundedExecution(future, () -> {
            future.cancel(true);
            EngineMetrics.emitAbortedExecution(ExecutionGuard.REASON_TIMEOUT, "simulation");
        }, String.format("simulation for game %s aborted after %dms", gameId, executionTimeoutMs));
    }

    // Waits for a submitted execution up to the configured timeout. On timeout runs the
    // recovery action and reports the abort; real errors thrown inside the execution
    // propagate unchanged so the API layer can map them.
    private <T> T awaitBoundedExecution(Future<T> future, Runnable onTimeout, String timeoutMessage) {
        try {
            return future.get(executionTimeoutMs + TIMEOUT_GRACE_MS, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            onTimeout.run();
            throw new RuleExecutionLimitException(timeoutMessage);
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            if (cause instanceof RuntimeException re) {
                throw re;
            }
            throw new RuntimeException(cause);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuleExecutionLimitException("execution interrupted: " + timeoutMessage);
        }
    }

    // Evict a jammed per-game executor so subsequent executions get a fresh thread,
    // and rescue queued-but-unstarted executions by resubmitting them to the new one.
    // The stale executor's running thread is abandoned (it ignores interruption).
    private synchronized void recoverGame(String gameId, ExecutorService staleExecutor) {
        executors.remove(gameId, staleExecutor);
        List<Runnable> pending = staleExecutor.shutdownNow();
        LogHub.error(gameId, logger, String.format(
                "aborted game execution queue reset; %d queued execution(s) rescued", pending.size()));
        if (!pending.isEmpty()) {
            ExecutorService fresh = getExecutor(gameId);
            pending.forEach(fresh::execute);
        }
    }

    // Gracefully shut down all per-game executors on application stop to avoid thread leaks
    @Override
    public void destroy() {
        logger.info("Shutting down {} game execution queues", executors.size());
        executors.values().forEach(ExecutorService::shutdown);
        executors.clear();
        if (simulationPool != null) {
            simulationPool.shutdownNow();
        }
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
