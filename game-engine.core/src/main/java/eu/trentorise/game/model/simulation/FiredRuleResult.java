package eu.trentorise.game.model.simulation;

import java.util.List;

public class FiredRuleResult {

    private String ruleName;
    private String cause;                 // rule that triggered this firing, null if fired from initial state
    private List<String> reads;           // from static analysis (populated later)
    private List<String> writes;          // from static analysis (populated later)
    private List<ConceptChange> changes;  // state changes caused by this specific rule

    public FiredRuleResult() {}

    public FiredRuleResult(String ruleName, String cause, List<String> reads, List<String> writes,
            List<ConceptChange> changes) {
        this.ruleName = ruleName;
        this.cause = cause;
        this.reads = reads;
        this.writes = writes;
        this.changes = changes;
    }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getCause() { return cause; }
    public void setCause(String cause) { this.cause = cause; }

    public List<String> getReads() { return reads; }
    public void setReads(List<String> reads) { this.reads = reads; }

    public List<String> getWrites() { return writes; }
    public void setWrites(List<String> writes) { this.writes = writes; }

    public List<ConceptChange> getChanges() { return changes; }
    public void setChanges(List<ConceptChange> changes) { this.changes = changes; }
}
