/**
 * Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package eu.trentorise.game.managers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.ListMultimap;
import eu.trentorise.game.core.LogHub;
import eu.trentorise.game.core.LoggingRuleListener;
import eu.trentorise.game.core.StatsLogger;
import eu.trentorise.game.core.Utility;
import eu.trentorise.game.managers.drools.KieContainerFactory;
import eu.trentorise.game.model.*;
import eu.trentorise.game.model.Level.Threshold;
import eu.trentorise.game.model.core.GameConcept;
import eu.trentorise.game.model.core.Notification;
import eu.trentorise.game.model.core.Rule;
import eu.trentorise.game.model.core.UrlRule;
import eu.trentorise.game.model.simulation.ConceptChange;
import eu.trentorise.game.model.simulation.FiredRuleResult;
import eu.trentorise.game.model.simulation.SimulationResult;
import eu.trentorise.game.notification.ChallengeCompletedNotication;
import eu.trentorise.game.notification.LevelGainedNotification;
import eu.trentorise.game.repo.ChallengeConceptPersistence;
import eu.trentorise.game.repo.ChallengeConceptRepo;
import eu.trentorise.game.services.GameEngine;
import eu.trentorise.game.services.GameService;
import eu.trentorise.game.services.PlayerService;
import eu.trentorise.game.services.Workflow;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.LogManager;
import org.drools.model.codegen.ExecutableModelProject;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.Message;
import org.kie.api.command.Command;
import org.kie.api.command.KieCommands;
import org.kie.api.event.rule.AfterMatchFiredEvent;
import org.kie.api.event.rule.DefaultAgendaEventListener;
import org.kie.api.runtime.ExecutionResults;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.StatelessKieSession;
import org.kie.api.runtime.rule.QueryResults;
import org.kie.api.runtime.rule.QueryResultsRow;
import org.perf4j.StopWatch;
import org.perf4j.log4j.Log4JStopWatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Component
public class DroolsEngine implements GameEngine {

    private final Logger logger = LoggerFactory.getLogger(DroolsEngine.class);

    // ObjectMapper is thread-safe once configured — reuse a single instance instead of
    // allocating a new one on every simulate() call
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private NotificationManager notificationSrv;

    @Autowired
    private GameService gameSrv;

    @Autowired
    private PlayerService playerSrv;

    @Autowired
    private Workflow workflow;

    @Autowired
    private KieContainerFactory kieContainerFactory;

    @Autowired
    private ChallengeConceptRepo challengeConceptRepo;

    public PlayerState execute(String gameId, PlayerState state, String action,
                               Map<String, Object> data, String executionId, long executionMoment,
                               List<Object> factObjects) {

        StopWatch stopWatch =
                LogManager.getLogger(StopWatch.DEFAULT_LOGGER_NAME).getAppender("perf-file") != null
                        ? new Log4JStopWatch() : null;
        if (stopWatch != null) {
            stopWatch.start("game execution");
        }

        List<ChallengeConceptPersistence> listCcs = challengeConceptRepo.findByGameIdAndPlayerId(gameId, state.getPlayerId());
        state.loadChallengeConcepts(listCcs);

        Game game = gameSrv.loadGameDefinitionById(gameId);
        if (game != null && game.isTerminated()) {
            throw new IllegalArgumentException(String.format("game %s is expired", gameId));
        }

        ConceptHelper conceptHelper = new ConceptHelper();

        KieContainer kieContainer = kieContainerFactory.getContainer(gameId);

        PlayerState stateBeforePlay = state.clone();
        StatelessKieSession kSession = kieContainer.newStatelessKieSession();
        kSession.addEventListener(new LoggingRuleListener(game.getDomain(), gameId,
                state.getPlayerId(), stateBeforePlay, executionId, executionMoment));

        KieCommands commands = KieServices.get().getCommands();
        List<Command> cmds = new ArrayList<Command>();

        if (data == null) {
            data = new HashMap<String, Object>();
        }
        cmds.add(commands.newInsert(new InputData(data)));

        if (!StringUtils.isBlank(action)) {
            cmds.add(commands.newInsert(new Action(action)));
        }

        if (factObjects != null) {
            cmds.add(commands.newInsertElements(factObjects));
        }

        cmds.add(commands.newInsert(new Game(gameId)));

        Player player = new Player(state);
        cmds.add(commands.newInsert(player));

        //push team state to kb.
        List<TeamState> playerTeams = playerSrv.readTeams(gameId, state.getPlayerId());
        for (TeamState ts : playerTeams) {
            cmds.add(commands.newInsert(new Player(ts)));
            CustomData insCustomData = ts.getCustomData();
            cmds.add(commands.newInsert(insCustomData));
        }


        // filter state removing all ended or completed challenges for the
        // player
        Set<GameConcept> concepts = new HashSet<>(state.getState());
        concepts = conceptHelper.injectExecutionMoment(concepts, executionMoment);
        concepts = conceptHelper.activateConcepts(concepts);

        Set<GameConcept> activeConcepts = conceptHelper.findActiveConcepts(concepts);

        Set<GameConcept> inactiveConcepts =
                new HashSet<>(CollectionUtils.subtract(concepts, activeConcepts));


        // ATTENTION: Drools modifies objects inserted in working memory by
        // reference
        cmds.add(commands.newInsertElements(activeConcepts));
        CustomData insCustomData = state.getCustomData();
        cmds.add(commands.newInsert(insCustomData));
        cmds.add(commands.newFireAllRules());

        // queries
        cmds.add(commands.newQuery("retrieveState", "getGameConcepts"));
        cmds.add(commands.newQuery("retrieveNotifications", "getNotifications"));
        cmds.add(commands.newQuery("retrieveCustomData", "getCustomData"));
        cmds.add(commands.newQuery("retrieveUpdateTeams", "getUpdateTeams"));
        cmds.add(commands.newQuery("retrieveUpdateMembers", "getUpdateMembers"));
        cmds.add(commands.newQuery("retrieveLevel", "getLevel"));
        cmds.add(commands.newQuery("retrieveMember", "getMember"));

        // set gameId as constant
        kSession.setGlobal("utils", new Utility(gameId));

        kSession = loadGameConstants(kSession, gameId);

        ExecutionResults results = kSession.execute(commands.newBatchExecution(cmds));

        // new state contains archived challenges and all GameConcept
        // loaded in engine session
        Set<GameConcept> newState = new HashSet<GameConcept>(inactiveConcepts);

        Iterator<QueryResultsRow> iter =
                ((QueryResults) results.getValue("retrieveState")).iterator();
        while (iter.hasNext()) {
            GameConcept stateElement = (GameConcept) iter.next().get("$result");
            newState.add(stateElement);
            if (stateElement instanceof ChallengeConcept) {
                ChallengeConcept challenge = (ChallengeConcept) stateElement;

                // normalize state, useful when action come from the past
                challenge.normalizeState();

                sendChallengeCompletedNotifications(challenge, gameId, player.getId(),
                        executionMoment);
                logCompletedChallenge(game.getDomain(), gameId, executionId, executionMoment,
                        player, challenge);
            }
        }

        List<CustomData> customData = new ArrayList<CustomData>();

        iter = ((QueryResults) results.getValue("retrieveCustomData")).iterator();
        while (iter.hasNext()) {
            CustomData stateCustomData = (CustomData) iter.next().get("$data");
            customData.add(stateCustomData);
        }

        iter = ((QueryResults) results.getValue("retrieveUpdateTeams")).iterator();

        if (iter.hasNext()) {
            Set<Object> facts = new HashSet<>();
            Iterator<QueryResultsRow> iter1 = null;
            while (iter.hasNext()) {
                UpdateTeams updateCalls = (UpdateTeams) iter.next().get("$data");
                iter1 = ((QueryResults) results.getValue("retrieveLevel")).iterator();
                int level = 1;
                if (iter1.hasNext()) {
                    level = (int) iter1.next().get("$data");
                    level++;
                }
                facts.add(new Propagation(updateCalls.getPropagationAction(), level));
                facts.add(new Transmission(updateCalls.getData()));
            }

            LogHub.info(gameId, logger, "Player {} belongs to {} teams", state.getPlayerId(),
                    playerTeams.size());
            if (playerTeams.size() > 0) {
                LogHub.info(gameId, logger, "call for update with data {}", data);
            }

            iter1 = ((QueryResults) results.getValue("retrieveMember")).iterator();
            Member fromPropagation = null;
            if (iter1.hasNext()) {
                fromPropagation = (Member) iter1.next().get("$data");
            }
            Map<String, Object> payloadData = new HashMap<>(data);
            if (fromPropagation != null && fromPropagation.getInputData() != null) {
                payloadData.putAll(fromPropagation.getInputData());
            }
            facts.add(new Member(state.getPlayerId(), payloadData));
            for (TeamState team : playerTeams) {
                workflow.apply(gameId, action, team.getPlayerId(), executionMoment, payloadData,
                        new ArrayList<>(facts));
            }
        }
        iter = ((QueryResults) results.getValue("retrieveUpdateMembers")).iterator();
        if (iter.hasNext()) {
            Set<Object> facts = new HashSet<>();
            while (iter.hasNext()) {
                UpdateMembers updateCalls = (UpdateMembers) iter.next().get("$data");
                facts.add(new Propagation(updateCalls.getPropagationAction()));
            }
            // check if a propagation to team members is needed
            try {
                TeamState team = playerSrv.readTeam(gameId, state.getPlayerId());
                List<String> members = team.getMembers();
                facts.add(new Team(state.getPlayerId(), data));
                LogHub.info(gameId, logger, "Team {} has {} members", state.getPlayerId(),
                        members.size());
                for (String member : members) {
                    workflow.apply(gameId, action, member, executionMoment, data,
                            new ArrayList<>(facts));
                }
            } catch (ClassCastException e) {
                LogHub.info(gameId, logger,
                        "{} is not a team, there is no propagation to team members",
                        state.getPlayerId());
            }

        }

        state.setState(newState);

        List<PlayerLevel> levelsAfterAction = gameSrv.calculateLevels(gameId, state);

        List<LevelInstance> newGainedLevels = newGainedLevels(game, state, levelsAfterAction);

        state = state.updateLevels(levelsAfterAction);
        logLevelStatus(gameId, levelsAfterAction);

        if (!newGainedLevels.isEmpty()) {
            state.updateInventory(game, newGainedLevels);
            LogHub.info(gameId, logger, String.format("Gained new levels %s", newGainedLevels));
            sendLevelNotifications(game.getDomain(), gameId, state.getPlayerId(), executionId,
                    executionMoment, System.currentTimeMillis(), newGainedLevels, game);
        }

        // fix for dataset prior than 0.9 version
        state.setCustomData(customData.isEmpty() ? new CustomData() : customData.get(0));

        if (stopWatch != null) {
            stopWatch.stop("game execution", String.format("execution for game %s of player %s",
                    gameId, state.getPlayerId()));
        }

        boolean result = playerSrv.saveState(state) != null;

        iter = ((QueryResults) results.getValue("retrieveNotifications")).iterator();
        while (iter.hasNext()) {
            Notification note = (Notification) iter.next().get("$notifications");
            notificationSrv.notificate(note);
            LogHub.info(gameId, logger, "send notification: {}", note.toString());
        }

        LogHub.info(gameId, logger, "player state updated: {}", result);

        return state;
    }


    @Override
    public SimulationResult simulate(String gameId, PlayerState state, String action,
                                     Map<String, Object> data, String executionId, long executionMoment,
                                     List<Object> factObjects, boolean showDetailedChanges) {

        // Load challenges from DB (same as execute)
        List<ChallengeConceptPersistence> listCcs =
                challengeConceptRepo.findByGameIdAndPlayerId(gameId, state.getPlayerId());
        state.loadChallengeConcepts(listCcs);

        Game game = gameSrv.loadGameDefinitionById(gameId);
        if (game != null && game.isTerminated()) {
            throw new IllegalArgumentException(String.format("game %s is expired", gameId));
        }

        // Snapshot before execution
        PlayerState beforeState = state.clone();

        // Deep-copy challenges separately since clone() excludes them
        List<ChallengeConcept> challengesBefore = new ArrayList<>();
        for (ChallengeConcept c : state.challenges()) {
            try {
                String json = OBJECT_MAPPER.writeValueAsString(c);
                challengesBefore.add(OBJECT_MAPPER.readValue(json, ChallengeConcept.class));
            } catch (Exception e) {
                logger.warn("Could not deep-copy challenge {} for simulation snapshot", c.getName());
            }
        }

        ConceptHelper conceptHelper = new ConceptHelper();
        KieContainer kieContainer = kieContainerFactory.getContainer(gameId);
        StatelessKieSession kSession = kieContainer.newStatelessKieSession();

        KieCommands commands = KieServices.get().getCommands();
        List<Command> cmds = new ArrayList<>();

        if (data == null) {
            data = new HashMap<>();
        }
        cmds.add(commands.newInsert(new InputData(data)));

        if (!StringUtils.isBlank(action)) {
            cmds.add(commands.newInsert(new Action(action)));
        }

        if (factObjects != null) {
            cmds.add(commands.newInsertElements(factObjects));
        }

        cmds.add(commands.newInsert(new Game(gameId)));

        Player player = new Player(state);
        cmds.add(commands.newInsert(player));

        // Push team state (read-only — no propagation in simulation)
        List<TeamState> playerTeams = playerSrv.readTeams(gameId, state.getPlayerId());
        for (TeamState ts : playerTeams) {
            cmds.add(commands.newInsert(new Player(ts)));
            cmds.add(commands.newInsert(ts.getCustomData()));
        }

        Set<GameConcept> concepts = new HashSet<>(state.getState());
        concepts = conceptHelper.injectExecutionMoment(concepts, executionMoment);
        concepts = conceptHelper.activateConcepts(concepts);

        Set<GameConcept> activeConcepts = conceptHelper.findActiveConcepts(concepts);
        Set<GameConcept> inactiveConcepts =
                new HashSet<>(CollectionUtils.subtract(concepts, activeConcepts));

        cmds.add(commands.newInsertElements(activeConcepts));
        cmds.add(commands.newInsert(state.getCustomData()));
        cmds.add(commands.newFireAllRules());
        cmds.add(commands.newQuery("retrieveState", "getGameConcepts"));

        List<FiredRuleResult> firedRules = new ArrayList<>();

        if (showDetailedChanges) {
            // Full listener: snapshots state before each rule fires and diffs after,
            // tracking per-rule concept changes and which rule caused each activation.
            // Has O(active_concepts × rules_fired) overhead — use only for debugging.
            kSession.addEventListener(new DefaultAgendaEventListener() {

                private final Map<String, Double> scoresBefore = new HashMap<>();
                private final Map<String, List<String>> badgesBefore = new HashMap<>();
                private final Map<String, String> challengeStateBefore = new HashMap<>();
                // tracks the last rule that modified each concept — used to determine cause
                private final Map<String, String> lastModifier = new HashMap<>();

                private void snapshot() {
                    for (GameConcept gc : activeConcepts) {
                        if (gc instanceof PointConcept) {
                            scoresBefore.put(gc.getName(), ((PointConcept) gc).getScore());
                        } else if (gc instanceof BadgeCollectionConcept) {
                            badgesBefore.put(gc.getName(),
                                    new ArrayList<>(((BadgeCollectionConcept) gc).getBadgeEarned()));
                        } else if (gc instanceof ChallengeConcept) {
                            ChallengeConcept cc = (ChallengeConcept) gc;
                            challengeStateBefore.put(gc.getName(),
                                    cc.getState() != null ? cc.getState().toString() : null);
                        }
                    }
                }

                @Override
                public void beforeMatchFired(org.kie.api.event.rule.BeforeMatchFiredEvent event) {
                    snapshot();
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
                    for (GameConcept gc : activeConcepts) {
                        if (gc instanceof PointConcept) {
                            PointConcept pc = (PointConcept) gc;
                            double before = scoresBefore.getOrDefault(gc.getName(), 0d);
                            if (Double.compare(before, pc.getScore()) != 0) {
                                ruleChanges.add(new ConceptChange("PointConcept", gc.getName(),
                                        "score", before, pc.getScore()));
                            }
                        } else if (gc instanceof BadgeCollectionConcept) {
                            BadgeCollectionConcept bcc = (BadgeCollectionConcept) gc;
                            List<String> before = badgesBefore.getOrDefault(
                                    gc.getName(), Collections.<String>emptyList());
                            List<String> newBadges = new ArrayList<>(bcc.getBadgeEarned());
                            newBadges.removeAll(before);
                            for (String badge : newBadges) {
                                ruleChanges.add(new ConceptChange("BadgeCollectionConcept",
                                        gc.getName(), "badgeEarned", null, badge));
                            }
                        } else if (gc instanceof ChallengeConcept) {
                            ChallengeConcept cc = (ChallengeConcept) gc;
                            String before = challengeStateBefore.get(gc.getName());
                            String after = cc.getState() != null ? cc.getState().toString() : null;
                            if (!java.util.Objects.equals(before, after)) {
                                ruleChanges.add(new ConceptChange("ChallengeConcept",
                                        gc.getName(), "state", before, after));
                            }
                        }
                    }

                    // Update lastModifier for each concept changed by this rule
                    for (ConceptChange change : ruleChanges) {
                        lastModifier.put(change.getConceptName(), ruleName);
                    }

                    firedRules.add(new FiredRuleResult(ruleName, cause,
                            Collections.emptyList(), Collections.emptyList(), ruleChanges));
                }
            });
        } else {
            // Lightweight listener: only tracks which rules fired and in what order
            kSession.addEventListener(new DefaultAgendaEventListener() {
                @Override
                public void afterMatchFired(AfterMatchFiredEvent event) {
                    firedRules.add(new FiredRuleResult(event.getMatch().getRule().getName(), null,
                            Collections.emptyList(), Collections.emptyList(), Collections.emptyList()));
                }
            });
        }

        kSession.setGlobal("utils", new Utility(gameId));
        kSession = loadGameConstants(kSession, gameId);

        ExecutionResults results = kSession.execute(commands.newBatchExecution(cmds));

        // Build final state from query results — no persistence, no notifications
        Set<GameConcept> newState = new HashSet<>(inactiveConcepts);
        Iterator<QueryResultsRow> iter =
                ((QueryResults) results.getValue("retrieveState")).iterator();
        while (iter.hasNext()) {
            newState.add((GameConcept) iter.next().get("$result"));
        }

        PlayerState finalState = new PlayerState(gameId, state.getPlayerId());
        finalState.setState(newState);

        List<ConceptChange> changes = computeDiff(beforeState, challengesBefore, finalState);

        return new SimulationResult(beforeState, finalState, firedRules, changes);
    }

    private List<ConceptChange> computeDiff(PlayerState before,
                                            List<ChallengeConcept> challengesBefore, PlayerState after) {

        List<ConceptChange> changes = new ArrayList<>();

        for (GameConcept afterConcept : after.getState()) {

            if (afterConcept instanceof PointConcept) {
                PointConcept afterPc = (PointConcept) afterConcept;
                double beforeScore = before.getState().stream()
                        .filter(c -> c instanceof PointConcept && c.getName().equals(afterPc.getName()))
                        .map(c -> ((PointConcept) c).getScore())
                        .findFirst().orElse(0d);
                if (Double.compare(afterPc.getScore(), beforeScore) != 0) {
                    changes.add(new ConceptChange("PointConcept", afterPc.getName(),
                            "score", beforeScore, afterPc.getScore()));
                }
            }

            if (afterConcept instanceof BadgeCollectionConcept) {
                BadgeCollectionConcept afterBcc = (BadgeCollectionConcept) afterConcept;
                List<String> beforeBadges = before.getState().stream()
                        .filter(c -> c instanceof BadgeCollectionConcept
                                && c.getName().equals(afterBcc.getName()))
                        .map(c -> ((BadgeCollectionConcept) c).getBadgeEarned())
                        .findFirst().orElse(Collections.<String>emptyList());
                List<String> newBadges = new ArrayList<>(afterBcc.getBadgeEarned());
                newBadges.removeAll(beforeBadges);
                for (String badge : newBadges) {
                    changes.add(new ConceptChange("BadgeCollectionConcept", afterBcc.getName(),
                            "badgeEarned", null, badge));
                }
            }

            if (afterConcept instanceof ChallengeConcept) {
                ChallengeConcept afterCc = (ChallengeConcept) afterConcept;
                challengesBefore.stream()
                        .filter(c -> c.getName().equals(afterCc.getName()))
                        .findFirst()
                        .ifPresent(beforeCc -> {
                            if (afterCc.getState() != beforeCc.getState()) {
                                changes.add(new ConceptChange("ChallengeConcept", afterCc.getName(),
                                        "state",
                                        beforeCc.getState() != null ? beforeCc.getState().toString() : null,
                                        afterCc.getState() != null ? afterCc.getState().toString() : null));
                            }
                        });
            }
        }

        return changes;
    }

    private void sendLevelNotifications(String domain, String gameId, String playerId,
                                        String executionId, long executionTime, long timestamp,
                                        List<LevelInstance> newGainedLevels, Game game) {
        newGainedLevels.forEach(instance -> {
            LevelGainedNotification notification = new LevelGainedNotification();
            notification.setGameId(gameId);
            notification.setPlayerId(playerId);
            notification.setLevelType(instance.getType());
            notification.setLevelName(instance.getName());
            int levelIndex = game.getLevelThresholds(instance.getType())
                    .indexOf(new Threshold(instance.getName(), -1));

            notification.setLevelIndex(levelIndex);
            notificationSrv.notificate(notification);
            LogHub.info(gameId, logger, "send notification: {}", notification.toString());
            StatsLogger.logLevelGained(domain, gameId, playerId, instance, executionId,
                    executionTime, timestamp);
        });

    }


    private List<LevelInstance> newGainedLevels(Game game, PlayerState state,
                                                List<PlayerLevel> levels) {

        List<PlayerLevel> oldLevels = state.getLevels();
        ListMultimap<String, String> levelProgression = ArrayListMultimap.create();

        List<LevelInstance> levelsGainedInGameAction = new ArrayList<>();
        oldLevels.forEach(
                level -> levelProgression.put(level.getLevelName(), level.getLevelValue()));
        levels.forEach(level -> levelProgression.put(level.getLevelName(), level.getLevelValue()));

        levelProgression.keySet().forEach(levelName -> {
            List<String> instanceProgression = levelProgression.get(levelName);
            // same level after game action
            if (instanceProgression.size() == 0 || (instanceProgression.size() == 2
                    && instanceProgression.get(0).equals(instanceProgression.get(1)))) {
                // do nothing
            } else {
                boolean neverGainedLevelOfThisType = instanceProgression.size() == 1;
                String levelValueGained = neverGainedLevelOfThisType
                        ? instanceProgression.get(0) : instanceProgression.get(1);
                List<LevelInstance> levelInstances = gainedLevels(
                        new LevelInstance(levelName, levelValueGained), game);
                int indexOfNewLevel = levelInstances.size() - 1;

                int indexOfPreviousLevel =
                        neverGainedLevelOfThisType ? 0
                                : levelInstances
                                .indexOf(new LevelInstance(levelName, instanceProgression.get(0))) + 1;
                for (int i = indexOfPreviousLevel; i <= indexOfNewLevel; i++) {
                    levelsGainedInGameAction.add(levelInstances.get(i));
                }
            }
        });

        return levelsGainedInGameAction;
    }


    private List<LevelInstance> gainedLevels(LevelInstance levelInstance, Game game) {
        List<LevelInstance> instances = new ArrayList<>();
        List<Threshold> levelThreshoolds = game.getLevelThresholds(levelInstance.getType());
        // if player has a level doesn't exist in game definition return empty instances
        if (!levelThreshoolds.contains(new Threshold(levelInstance.getName(), 0d))) {
            return instances;
        }
        for (Threshold threshold : levelThreshoolds) {
            instances.add(new LevelInstance(levelInstance.getType(), threshold.getName()));
            if (threshold.getName().equals(levelInstance.getName())) {
                break;
            }
        }
        return instances;
    }

    private void logLevelStatus(String gameId, List<PlayerLevel> levels) {
        if (levels != null && !levels.isEmpty()) {
            StringBuffer levelStatus = new StringBuffer();
            for (PlayerLevel lev : levels) {
                if (levelStatus.length() != 0) {
                    levelStatus.append(",");
                }
                levelStatus.append(String.format("{levelName=%s,levelValue=%s,toNextLevel=%s}",
                        lev.getLevelName(), lev.getLevelValue(), lev.getToNextLevel()));
            }
            LogHub.info(gameId, logger, "Level status: " + levelStatus.toString());
        }


    }

    private void logCompletedChallenge(String domain, String gameId, String executionId,
                                       long executionMoment, Player player, ChallengeConcept challenge) {
        if (challenge != null && challenge.isCompleted()) {
            StatsLogger.logChallengeCompleted(domain, gameId, player.getId(), executionId,
                    executionMoment, System.currentTimeMillis(), challenge.getName());
        }
    }

    private void sendChallengeCompletedNotifications(ChallengeConcept stateElement, String gameId,
                                                     String playerId, long executionMoment) {
        if (stateElement.isCompleted()) {
            ChallengeCompletedNotication challengeNotification = new ChallengeCompletedNotication();
            challengeNotification.setGameId(gameId);
            challengeNotification.setPlayerId(playerId);
            challengeNotification.setChallengeName(stateElement.getName());
            challengeNotification.setTimestamp(executionMoment);
            challengeNotification.setModel(stateElement.getModelName());
            challengeNotification.setPointConcept(stateElement.getFields().containsKey("counterName") ? String.valueOf(stateElement.getFields().get("counterName")) : "");
            challengeNotification.setStart(stateElement.getStart().getTime());
            challengeNotification.setEnd(stateElement.getEnd().getTime());
            notificationSrv.notificate(challengeNotification);
            LogHub.info(gameId, logger, "send notification: {}", challengeNotification.toString());
        }
    }


    private StatelessKieSession loadGameConstants(StatelessKieSession kSession, String gameId) {

        // load game constants
        InputStream constantsFileStream = null;
        Game g = gameSrv.loadGameDefinitionById(gameId);
        if (g != null && g.getRules() != null) {
            for (String ruleUrl : g.getRules()) {
                Rule r = gameSrv.loadRule(gameId, ruleUrl);
                if ((r != null && r.getName() != null && r.getName().equals("constants"))
                        || r instanceof UrlRule && ((UrlRule) r).getUrl().contains("constants")) {
                    try {
                        constantsFileStream = r.getInputStream();
                    } catch (IOException e) {
                        LogHub.error(gameId, logger, "Exception loading constants file", e);
                    }
                }
            }
        }

        if (constantsFileStream != null) {
            try {
                PropertiesConfiguration constants = new PropertiesConfiguration();
                constants.load(constantsFileStream);
                constants.setListDelimiter(',');
                LogHub.debug(gameId, logger, "constants file loaded for game {}", gameId);
                Iterator<String> constantsIter = constants.getKeys();
                while (constantsIter.hasNext()) {
                    String constant = constantsIter.next();
                    Object value = numberConversion(constants.getProperty(constant));
                    kSession.setGlobal(constant, value);
                    if (logger.isDebugEnabled()) {
                        List<Object> listValue = constants.getList(constant);
                        if (listValue.isEmpty()) {
                            LogHub.debug(gameId, logger, "constant {} loaded: {}", constant, value);
                        } else {
                            LogHub.debug(gameId, logger, "constant {} loaded: {}, size: {}",
                                    constant, listValue, listValue.size());
                        }
                    }
                }
            } catch (ConfigurationException e) {
                LogHub.error(gameId, logger, "constants loading exception");
            }
        } else {
            LogHub.info(gameId, logger, "Rule constants file not found");
        }
        return kSession;
    }

    private Object numberConversion(Object value) {

        if (value instanceof String) {
            String converted = (String) value;
            if (NumberUtils.isNumber(converted) && converted.toLowerCase().contains("l")) {
                return Long.parseLong(converted.substring(0, converted.length() - 1));
            }
            if (NumberUtils.isNumber(converted) && !converted.contains(".")) {
                return Integer.valueOf(converted);
            }
            if (NumberUtils.isNumber(converted) && converted.contains(".")) {
                return Double.valueOf(converted);
            }
        }

        return value;
    }


    @Override
    public Map<String, Message> validateRule(String gameId, String content) {
        Map<String, Message> result = new HashMap<>();
        if (content != null) {
            KieServices ks = KieServices.get();
            KieFileSystem kfs = ks.newKieFileSystem();
            kfs.write(ks.getResources()
                    .newReaderResource(new java.io.StringReader(content))
                    .setSourcePath("rules/validate/rule.drl"));
            KieBuilder kieBuilder = ks.newKieBuilder(kfs);
            kieBuilder.buildAll(ExecutableModelProject.class);
            kieBuilder.getResults().getMessages(Message.Level.ERROR)
                    .forEach(msg -> {
                        result.put(String.valueOf(msg.getId()), msg);
                    });
        }
        return result;
    }
}
