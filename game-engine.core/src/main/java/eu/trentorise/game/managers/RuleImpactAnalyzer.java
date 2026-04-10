package eu.trentorise.game.managers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.drools.impact.analysis.graph.Graph;
import org.drools.impact.analysis.graph.ModelToGraphConverter;
import org.drools.impact.analysis.graph.Node;
import org.drools.impact.analysis.model.AnalysisModel;
import org.drools.impact.analysis.model.Package;
import org.drools.impact.analysis.model.Rule;
import org.drools.impact.analysis.model.left.Constraint;
import org.drools.impact.analysis.model.left.Pattern;
import org.drools.impact.analysis.model.right.ConsequenceAction;
import org.drools.impact.analysis.model.right.ModifyAction;
import org.drools.impact.analysis.parser.ModelBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.DBRule;
import eu.trentorise.game.model.impact.ActivationLink;
import eu.trentorise.game.model.impact.GameImpactResult;
import eu.trentorise.game.model.impact.RuleImpact;
import eu.trentorise.game.services.GameService;

/**
 * Statically analyzes DRL rules using drools-impact-analysis to determine:
 * - Which specific fact properties each rule reads (LHS constraints)
 * - Which specific fact properties each rule writes (RHS modifications)
 * - Which other rules may be activated by each rule's changes (impact graph)
 *
 * Results are cached per gameId and automatically invalidated on rule changes.
 * Only DBRules are analyzed — classpath/filesystem rules are skipped.
 */
@Component
public class RuleImpactAnalyzer {

    private static final Logger logger = LoggerFactory.getLogger(RuleImpactAnalyzer.class);

    private final ConcurrentHashMap<String, GameImpactResult> cache = new ConcurrentHashMap<>();

    @Autowired
    private GameService gameSrv;

    public GameImpactResult analyze(String gameId) {
        return cache.computeIfAbsent(gameId, this::buildImpactResult);
    }

    public void purge(String gameId) {
        cache.remove(gameId);
        logger.debug("Purged impact analysis cache for game {}", gameId);
    }

    private GameImpactResult buildImpactResult(String gameId) {
        Game game = gameSrv.loadGameDefinitionById(gameId);
        if (game == null || game.getRules() == null) {
            return new GameImpactResult(new HashMap<>());
        }

        List<String> drlContents = new ArrayList<>();
        for (String ruleUrl : game.getRules()) {
            eu.trentorise.game.model.core.Rule r = gameSrv.loadRule(gameId, ruleUrl);
            if (r instanceof DBRule && ((DBRule) r).getContent() != null) {
                drlContents.add(((DBRule) r).getContent());
            }
        }

        if (drlContents.isEmpty()) {
            return new GameImpactResult(new HashMap<>());
        }

        try {
            AnalysisModel model = new ModelBuilder()
                    .build(drlContents.toArray(new String[0]));

            Graph graph = new ModelToGraphConverter().toGraph(model);

            Map<String, Node> nodeByName = new HashMap<>();
            for (Node node : graph.getNodeMap().values()) {
                nodeByName.put(node.getRuleName(), node);
            }

            Map<String, RuleImpact> rules = new HashMap<>();
            for (Package pkg : model.getPackages()) {
                for (Rule rule : pkg.getRules()) {
                    Set<String> reads         = extractReads(rule);
                    Set<String> writes        = extractWrites(rule);
                    List<ActivationLink> activates = extractActivates(rule.getName(), nodeByName);
                    rules.put(rule.getName(), new RuleImpact(reads, writes, activates));
                }
            }

            logger.debug("Impact analysis built for game {}: {} rules", gameId, rules.size());
            return new GameImpactResult(rules);

        } catch (Exception e) {
            logger.error("Failed to build impact analysis for game {}", gameId, e);
            return new GameImpactResult(new HashMap<>());
        }
    }

    private Set<String> extractReads(Rule rule) {
        Set<String> reads = new HashSet<>();
        for (Pattern pattern : rule.getLhs().getPatterns()) {
            String typeName = pattern.getPatternClass().getSimpleName();
            if (pattern.getConstraints().isEmpty() || pattern.isClassReactive()) {
                reads.add(typeName);
            } else {
                for (Constraint constraint : pattern.getConstraints()) {
                    String property = constraint.getProperty();
                    reads.add(property != null ? typeName + "." + property : typeName);
                }
            }
        }
        return reads;
    }

    private Set<String> extractWrites(Rule rule) {
        Set<String> writes = new HashSet<>();
        for (ConsequenceAction action : rule.getRhs().getActions()) {
            String typeName = action.getActionClass().getSimpleName();
            if (action instanceof ModifyAction) {
                ModifyAction modify = (ModifyAction) action;
                if (modify.getModifiedProperties().isEmpty()) {
                    writes.add(typeName);
                } else {
                    modify.getModifiedProperties().forEach(prop ->
                            writes.add(typeName + "." + prop.getProperty()));
                }
            } else {
                writes.add(typeName);
            }
        }
        return writes;
    }

    private List<ActivationLink> extractActivates(String ruleName, Map<String, Node> nodeByName) {
        Node node = nodeByName.get(ruleName);
        if (node == null) return new ArrayList<>();
        return node.getOutgoingLinks().stream()
                .map(link -> new ActivationLink(
                        link.getTarget().getRuleName(),
                        link.getReactivityType().name()))
                .collect(Collectors.toList());
    }
}
