package eu.trentorise.game.core.listener;

import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.model.simulation.FiredRuleResult;
import org.drools.core.event.DefaultAgendaEventListener;

import java.util.ArrayList;
import java.util.List;

public abstract class BaseSimulationEventListener extends DefaultAgendaEventListener {

    protected List<GameConcept> activeGameConcepts;

    protected List<FiredRuleResult> firedRule;

    public BaseSimulationEventListener(List<GameConcept> activeGameConcepts){
        this.activeGameConcepts = activeGameConcepts;
        this.firedRule = new ArrayList<>();
    }

    public List<GameConcept> getActiveGameConcepts() {
        return activeGameConcepts;
    }

    public List<FiredRuleResult> getFiredRule() {
        return firedRule;
    }

}
