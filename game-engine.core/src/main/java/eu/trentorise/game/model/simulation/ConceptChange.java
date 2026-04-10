package eu.trentorise.game.model.simulation;

public class ConceptChange {

    private String conceptType;  // "PointConcept", "BadgeCollectionConcept", "ChallengeConcept"
    private String conceptName;
    private String field;        // "score", "badgeEarned", "state", "fields.current"
    private Object before;
    private Object after;

    public ConceptChange() {}

    public ConceptChange(String conceptType, String conceptName, String field,
            Object before, Object after) {
        this.conceptType = conceptType;
        this.conceptName = conceptName;
        this.field = field;
        this.before = before;
        this.after = after;
    }

    public String getConceptType() { return conceptType; }
    public void setConceptType(String conceptType) { this.conceptType = conceptType; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public Object getBefore() { return before; }
    public void setBefore(Object before) { this.before = before; }

    public Object getAfter() { return after; }
    public void setAfter(Object after) { this.after = after; }
}
