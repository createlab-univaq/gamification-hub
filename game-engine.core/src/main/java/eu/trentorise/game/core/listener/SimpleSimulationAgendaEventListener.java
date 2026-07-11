package eu.trentorise.game.core.listener;

import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.model.simulation.FiredRuleResult;
import org.kie.api.event.rule.AfterMatchFiredEvent;

import java.util.Collections;
import java.util.List;

public class SimpleSimulationAgendaEventListener extends BaseSimulationEventListener {

    public SimpleSimulationAgendaEventListener(List<GameConcept> activeGameConcepts) {
        super(activeGameConcepts);
    }

    @Override
    public void afterMatchFired(AfterMatchFiredEvent event) {
        this.firedRule.add(new FiredRuleResult(event.getMatch().getRule().getName(), null,
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList()));
    }

}
