package eu.trentorise.game.model.simulation;

import eu.trentorise.game.model.PlayerState;

import java.util.List;

public class SimulationResult {

    private PlayerState initialState;
    private PlayerState finalState;
    private List<FiredRuleResult> firedRules;
    private List<ConceptChange> changes;

    public SimulationResult() {}

    public SimulationResult(PlayerState initialState, PlayerState finalState,
            List<FiredRuleResult> firedRules, List<ConceptChange> changes) {
        this.initialState = initialState;
        this.finalState = finalState;
        this.firedRules = firedRules;
        this.changes = changes;
    }

    public PlayerState getInitialState() { return initialState; }
    public void setInitialState(PlayerState initialState) { this.initialState = initialState; }

    public PlayerState getFinalState() { return finalState; }
    public void setFinalState(PlayerState finalState) { this.finalState = finalState; }

    public List<FiredRuleResult> getFiredRules() { return firedRules; }
    public void setFiredRules(List<FiredRuleResult> firedRules) { this.firedRules = firedRules; }

    public List<ConceptChange> getChanges() { return changes; }
    public void setChanges(List<ConceptChange> changes) { this.changes = changes; }
}
