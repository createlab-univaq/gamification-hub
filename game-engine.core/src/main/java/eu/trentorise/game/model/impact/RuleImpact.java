package eu.trentorise.game.model.impact;

import eu.trentorise.game.model.simulation.ConceptChange;

import java.util.List;
import java.util.Set;

public class RuleImpact {

    private final Set<ConceptChange> reads;
    private final Set<ConceptChange> writes;
    private final List<ActivationLink> activates;

    public RuleImpact(Set<ConceptChange> reads, Set<ConceptChange> writes, List<ActivationLink> activates) {
        this.reads = reads;
        this.writes = writes;
        this.activates = activates;
    }

    public Set<ConceptChange> getReads() { return reads; }
    public Set<ConceptChange> getWrites() { return writes; }
    public List<ActivationLink> getActivates() { return activates; }
}
