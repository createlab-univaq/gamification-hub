package eu.trentorise.game.model.simulation;

import java.util.Objects;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ConceptChange)) return false;
        ConceptChange that = (ConceptChange) o;
        return Objects.equals(conceptType, that.conceptType)
                && Objects.equals(conceptName, that.conceptName)
                && Objects.equals(field, that.field)
                && Objects.equals(before, that.before)
                && Objects.equals(after, that.after);
    }

    @Override
    public int hashCode() {
        return Objects.hash(conceptType, conceptName, field, before, after);
    }
}
