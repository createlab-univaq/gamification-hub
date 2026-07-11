package eu.trentorise.game.core;

import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.micrometer.core.instrument.Metrics;
import io.micrometer.core.instrument.Timer;

public class PerfMonitor {

    private static final Logger logger = LoggerFactory.getLogger("perf");

    private final Timer.Sample sample;

    private PerfMonitor() {
        this.sample = Timer.start(Metrics.globalRegistry);
    }

    public static PerfMonitor start() {
        return new PerfMonitor();
    }

    public void stop(String metricName, String gameId, String message) {
        stop(metricName, "gameId", gameId, message);
    }

    public void stop(String metricName, String tagKey, String tagValue, String message) {
        long elapsedNanos = sample.stop(Metrics.globalRegistry.timer(metricName,
                tagKey, tagValue != null ? tagValue : "unknown"));
        logger.info("time[{}ms] metric[{}] {}[{}] message[{}]",
                TimeUnit.NANOSECONDS.toMillis(elapsedNanos), metricName, tagKey, tagValue, message);
    }

}
