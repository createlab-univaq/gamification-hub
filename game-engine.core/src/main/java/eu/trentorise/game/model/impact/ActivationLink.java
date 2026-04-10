package eu.trentorise.game.model.impact;

public class ActivationLink {

    private final String ruleName;
    private final String reactivity; // POSITIVE, NEGATIVE, UNKNOWN

    public ActivationLink(String ruleName, String reactivity) {
        this.ruleName = ruleName;
        this.reactivity = reactivity;
    }

    public String getRuleName() { return ruleName; }
    public String getReactivity() { return reactivity; }
}
