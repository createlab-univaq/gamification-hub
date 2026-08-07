package eu.trentorise.game.core;

import io.micrometer.core.instrument.Metrics;

/**
 * Single source of truth for the engine's Micrometer metric names, plus stateless
 * fire-and-forget emissions. Metrics live under the engine.metrics.* namespace and are
 * emitted through the static global registry so instrumentation never requires dependency
 * injection (many emission points, e.g. ExecutionGuard, are not Spring-managed beans).
 * Stateful timing lives in PerfMonitor, which owns its own Timer.Sample.
 */
public class EngineMetrics {

    public static final String EXECUTIONS = "engine.metrics.executions";
    public static final String SIMULATIONS = "engine.metrics.simulations";
    public static final String RULE_INSERT = "engine.metrics.rule-insert";
    public static final String LOAD_STATES = "engine.metrics.load-states";
    public static final String RULE_LISTENER = "engine.metrics.rule-listener";
    public static final String ABORTED_EXECUTIONS = "engine.metrics.aborted-executions";

    private EngineMetrics() {
    }

    public static void emitAbortedExecution(String reason, String type) {
        Metrics.globalRegistry.counter(ABORTED_EXECUTIONS, "reason", reason, "type", type).increment();
    }

}
