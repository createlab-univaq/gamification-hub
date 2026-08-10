package eu.trentorise.game.core;

public class RuleExecutionLimitException extends RuntimeException {

    protected String limitType;

    public RuleExecutionLimitException(String message) {
        super(message);
        this.limitType = "";
    }

    public RuleExecutionLimitException(String message, String limitType) {
        super(message);
        this.limitType = limitType;
    }

    public String getLimitType() {
        return limitType;
    }

    public void setLimitType(String limitType) {
        this.limitType = limitType;
    }

}
