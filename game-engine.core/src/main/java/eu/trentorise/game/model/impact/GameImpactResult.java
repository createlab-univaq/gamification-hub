package eu.trentorise.game.model.impact;

import java.util.Map;

public class GameImpactResult {

    private final Map<String, RuleImpact> rules;

    public GameImpactResult(Map<String, RuleImpact> rules) {
        this.rules = rules;
    }

    public Map<String, RuleImpact> getRules() { return rules; }
}
