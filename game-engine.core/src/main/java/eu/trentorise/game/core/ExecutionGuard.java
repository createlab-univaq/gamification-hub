package eu.trentorise.game.core;

import org.kie.api.event.rule.AfterMatchFiredEvent;
import org.kie.api.event.rule.DefaultAgendaEventListener;

public class ExecutionGuard extends DefaultAgendaEventListener {

    private final long maxFirings;
    private final long timeoutMs;
    private final long startMs;

    public static final String REASON_FIRINGS = "firings";
    public static final String REASON_TIMEOUT = "timeout";

    private long firings = 0;
    private volatile boolean tripped = false;
    private String reason;
    private String reasonTag;

    public ExecutionGuard(long maxFirings, long timeoutMs) {
        this.maxFirings = maxFirings;
        this.timeoutMs = timeoutMs;
        this.startMs = System.currentTimeMillis();
    }

    @Override
    public void afterMatchFired(AfterMatchFiredEvent event) {
        firings++;
        if (firings > maxFirings) {
            trip(REASON_FIRINGS, "exceeded " + maxFirings + " rule firings (possible infinite loop in rules)");
            event.getKieRuntime().halt();
        } else if (elapsed() > timeoutMs) {
            trip(REASON_TIMEOUT, "exceeded " + timeoutMs + "ms execution time");
            event.getKieRuntime().halt();
        }
    }

    private void trip(String tag, String r) {
        if (!tripped) {
            tripped = true;
            reasonTag = tag;
            reason = r;
        }
    }

    private long elapsed() {
        return System.currentTimeMillis() - startMs;
    }

    public boolean isTripped() {
        return tripped || elapsed() > timeoutMs;
    }

    public String getReason() {
        return tripped ? reason : "exceeded " + timeoutMs + "ms execution time";
    }

    public String getReasonTag() {
        return tripped ? reasonTag : REASON_TIMEOUT;
    }

}
