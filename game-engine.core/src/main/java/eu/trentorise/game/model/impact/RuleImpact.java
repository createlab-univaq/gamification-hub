package eu.trentorise.game.model.impact;

import java.util.List;
import java.util.Set;

public class RuleImpact {

    private final Set<String> reads;
    private final Set<String> writes;
    private final List<ActivationLink> activates;

    public RuleImpact(Set<String> reads, Set<String> writes, List<ActivationLink> activates) {
        this.reads = reads;
        this.writes = writes;
        this.activates = activates;
    }

    public Set<String> getReads() { return reads; }
    public Set<String> getWrites() { return writes; }
    public List<ActivationLink> getActivates() { return activates; }
}
