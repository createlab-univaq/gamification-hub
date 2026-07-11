package eu.trentorise.game.core.listener;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.model.simulation.ConceptChange;
import eu.trentorise.game.model.simulation.FiredRuleResult;
import org.kie.api.event.rule.AfterMatchFiredEvent;
import org.kie.api.event.rule.BeforeMatchFiredEvent;
import org.kie.api.runtime.KieRuntime;

import java.util.*;

public class SimulationAgendaEventListener extends BaseSimulationEventListener {

    private final Map<String, Double> scoresBefore = new HashMap<>();
    private final Map<String, List<String>> badgesBefore = new HashMap<>();
    private final Map<String, String> challengeStateBefore = new HashMap<>();
    // tracks the last rule that modified each concept — used to determine cause
    private final Map<String, String> lastModifier = new HashMap<>();

    public SimulationAgendaEventListener() {
        this(new ArrayList<>(), new ArrayList<>());
    }

    public SimulationAgendaEventListener(List<GameConcept> activeConcepts, List<FiredRuleResult> firedRules) {
        super(activeConcepts);
        this.firedRule = firedRules;
    }

    private void snapshot(KieRuntime kieSession) {
        scoresBefore.clear();
        badgesBefore.clear();
        challengeStateBefore.clear();
        for (Object gc : kieSession.getObjects()) {
            if (gc instanceof PointConcept pc) {
                scoresBefore.put(pc.getName(), pc.getScore());
            } else if (gc instanceof BadgeCollectionConcept bcc) {
                badgesBefore.put(bcc.getName(), new ArrayList<>((bcc.getBadgeEarned())));
            } else if (gc instanceof ChallengeConcept cc) {
                challengeStateBefore.put(cc.getName(), cc.getState() != null ? cc.getState().toString() : null);
            }
        }
    }

    @Override
    public void beforeMatchFired(BeforeMatchFiredEvent event) {
        snapshot(event.getKieRuntime());
    }

    @Override
    public void afterMatchFired(AfterMatchFiredEvent event) {
        String ruleName = event.getMatch().getRule().getName();
        // Determine cause: find the last rule that modified any matched concept
        String cause = null;
        for (Object obj : event.getMatch().getObjects()) {
            if (obj instanceof GameConcept) {
                String modifier = lastModifier.get(((GameConcept) obj).getName());
                if (modifier != null) {
                    cause = modifier;
                    break;
                }
            }
        }

        // Compute per-rule changes
        List<ConceptChange> ruleChanges = new ArrayList<>();
        for (Object gc : event.getKieRuntime().getObjects()) {
            if (gc instanceof PointConcept) {
                PointConcept pc = (PointConcept) gc;
                Double before = scoresBefore.getOrDefault(pc.getName(), null);
                if (Objects.isNull(before) || Double.compare(before, pc.getScore()) != 0) {
                    ruleChanges.add(new ConceptChange("PointConcept", pc.getName(), "score", before, pc.getScore()));
                }
            } else if (gc instanceof BadgeCollectionConcept) {
                BadgeCollectionConcept bcc = (BadgeCollectionConcept) gc;
                List<String> before = badgesBefore.getOrDefault(bcc.getName(), Collections.<String>emptyList());
                List<String> newBadges = new ArrayList<>(bcc.getBadgeEarned());
                newBadges.removeAll(before);
                for (String badge : newBadges) {
                    ruleChanges.add(new ConceptChange("BadgeCollectionConcept", bcc.getName(), "badgeEarned", null, badge));
                }
            } else if (gc instanceof ChallengeConcept) {
                ChallengeConcept cc = (ChallengeConcept) gc;
                String before = challengeStateBefore.get(cc.getName());
                String after = cc.getState() != null ? cc.getState().toString() : null;
                if (!java.util.Objects.equals(before, after)) {
                    ruleChanges.add(new ConceptChange("ChallengeConcept", cc.getName(), "state", before, after));
                }
            }
        }

        // Update lastModifier for each concept changed by this rule
        for (ConceptChange change : ruleChanges) {
            lastModifier.put(change.getConceptName(), ruleName);
        }

        this.firedRule.add(new FiredRuleResult(ruleName, cause, Collections.emptyList(), Collections.emptyList(), ruleChanges));
    }

}
