package eu.trentorise.game.managers.drools;

import java.io.StringReader;
import java.net.MalformedURLException;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang.StringUtils;
import org.drools.model.codegen.ExecutableModelProject;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.Message;
import org.kie.api.builder.ReleaseId;
import org.kie.api.io.Resource;
import org.kie.api.runtime.KieContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import eu.trentorise.game.core.LogHub;
import eu.trentorise.game.managers.DroolsEngine;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.core.ClasspathRule;
import eu.trentorise.game.model.core.DBRule;
import eu.trentorise.game.model.core.FSRule;
import eu.trentorise.game.model.core.Rule;
import eu.trentorise.game.services.GameService;

@Component
public class KieContainerFactoryImpl implements KieContainerFactory {

    // ConcurrentHashMap prevents data races on concurrent reads/writes from multiple request threads
    private final ConcurrentHashMap<String, KieContainer> containersCache = new ConcurrentHashMap<>();

    private final Logger logger = LoggerFactory.getLogger(DroolsEngine.class);

    private final KieServices kieServices = KieServices.get();

    @Autowired
    private GameService gameSrv;

    private void checkGameId(String gameId) {
        if (StringUtils.isBlank(gameId)) {
            throw new IllegalArgumentException("gameId cannot be blank");
        }
    }

    // Assigns a unique internal Drools key per game so concurrent compilations for different
    // games never overwrite each other's artifact in the shared global KieRepository
    private ReleaseId gameReleaseId(String gameId) {
        return kieServices.newReleaseId("eu.trentorise.game", "game-" + gameId, "1.0");
    }

    private KieContainer containerInstance(String gameId) {
        loadGameRules(gameId);
        LogHub.info(gameId, logger, "created new container for game {}", gameId);
        return kieServices.newKieContainer(gameReleaseId(gameId));
    }

    @Override
    public KieContainer getContainer(String gameId) {
        checkGameId(gameId);
        // computeIfAbsent is atomic per key: the mapping function runs at most once per gameId,
        // preventing double compilation and concurrent build races for the same game
        return containersCache.computeIfAbsent(gameId, id -> {
            LogHub.info(id, logger, "no container found for game {}, building...", id);
            KieContainer container = containerInstance(id);
            LogHub.info(id, logger, "container cached for game {}", id);
            return container;
        });
    }

    @Override
    public KieContainer purgeContainer(String gameId) {
        checkGameId(gameId);

        KieContainer purged = containersCache.remove(gameId);
        if (purged != null) {
            // Disposing releases the KieBase, compiled classloader and associated resources,
            // preventing classloader leaks on repeated rule hot-reloads
            try {
                purged.dispose();
            } catch (Exception e) {
                LogHub.error(gameId, logger, "Error disposing container for game {}", gameId, e);
            }
            LogHub.info(gameId, logger, "purged and disposed container for game {}", gameId);
        } else {
            LogHub.info(gameId, logger, "trying to purge not existing container for game {}", gameId);
        }
        return purged;
    }

    private void loadGameRules(String gameId) {
        checkGameId(gameId);

        ReleaseId releaseId = gameReleaseId(gameId);
        KieFileSystem kfs = kieServices.newKieFileSystem();

        // Bind this KieFileSystem to the game-specific internal Drools key so its compiled
        // artifact is stored separately from other games in the global KieRepository.
        // Without this all games share the default key and concurrent compilations silently
        // overwrite each other's ruleset.
        kfs.writePomXML(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<project>\n" +
            "  <modelVersion>4.0.0</modelVersion>\n" +
            "  <groupId>eu.trentorise.game</groupId>\n" +
            "  <artifactId>game-" + gameId + "</artifactId>\n" +
            "  <version>1.0</version>\n" +
            "</project>"
        );

        RuleLoader ruleLoader = new RuleLoader(gameId);

        try {
            Resource coreRes = ruleLoader.load("classpath://rules/core.drl");
            kfs.write(coreRes);
            Resource groupChallengesRewardRules = ruleLoader.load("classpath://rules/groupChallengeReward.drl");
            kfs.write(groupChallengesRewardRules);
            LogHub.info(gameId, logger, "Core rules loaded");
        } catch (MalformedURLException e) {
            LogHub.error(gameId, logger, "Exception loading core rules", e);
        }

        Game game = gameSrv.loadGameDefinitionById(gameId);
        if (game != null && game.getRules() != null) {
            for (String rule : game.getRules()) {
                try {
                    Resource r1 = ruleLoader.load(rule);
                    if (r1 != null) {
                        kfs.write(r1);
                        LogHub.debug(gameId, logger, "{} loaded", rule);
                    }
                } catch (MalformedURLException e) {
                    LogHub.error(gameId, logger, "Malformed URL loading rule {}, rule not loaded", rule);
                } catch (RuntimeException e) {
                    LogHub.error(gameId, logger, "Exception loading rule {}", rule);
                }
            }
        }

        KieBuilder kieBuilder = kieServices.newKieBuilder(kfs);
        kieBuilder.buildAll(ExecutableModelProject.class);
        kieBuilder.getResults().getMessages(Message.Level.ERROR)
                .forEach(msg -> LogHub.error(gameId, logger, "Rule compilation error: [{}:{}] {}",
                        msg.getPath(), msg.getLine(), msg.getText()));
        kieBuilder.getResults().getMessages(Message.Level.WARNING)
                .forEach(msg -> LogHub.info(gameId, logger, "Rule compilation warning: [{}:{}] {}",
                        msg.getPath(), msg.getLine(), msg.getText()));
        LogHub.info(gameId, logger, "Rules repository built for game {}", gameId);
    }

    private class RuleLoader {
        private final String gameId;

        public RuleLoader(String gameId) {
            this.gameId = gameId;
        }

        public boolean isConstantsRule(String ruleUrl) {
            boolean classpathCheck = ruleUrl.startsWith(ClasspathRule.URL_PROTOCOL)
                    && ruleUrl.contains("/constants");
            boolean fsCheck = ruleUrl.startsWith(FSRule.URL_PROTOCOL) && ruleUrl.contains("/constants");
            boolean dbCheck = ruleUrl.startsWith(DBRule.URL_PROTOCOL);
            if (dbCheck) {
                Rule r = gameSrv.loadRule(gameId, ruleUrl);
                dbCheck = r != null && r.getName() != null && r.getName().equals("constants");
            }
            return classpathCheck || fsCheck || dbCheck;
        }

        public Resource load(String ruleUrl) throws MalformedURLException {
            if (isConstantsRule(ruleUrl)) {
                return null;
            }
            if (ruleUrl.startsWith(ClasspathRule.URL_PROTOCOL)) {
                String url = ruleUrl.substring(ClasspathRule.URL_PROTOCOL.length());
                return kieServices.getResources().newClassPathResource(url);
            } else if (ruleUrl.startsWith(FSRule.URL_PROTOCOL)) {
                String url = ruleUrl.substring(FSRule.URL_PROTOCOL.length());
                return kieServices.getResources().newFileSystemResource(url);
            } else if (ruleUrl.startsWith(DBRule.URL_PROTOCOL)) {
                Rule r = gameSrv.loadRule(gameId, ruleUrl);
                if (r != null) {
                    Resource res = kieServices.getResources()
                            .newReaderResource(new StringReader(((DBRule) r).getContent()));
                    res.setSourcePath("rules/" + r.getGameId() + "/" + ((DBRule) r).getId() + ".drl");
                    return res;
                } else {
                    LogHub.error(ruleUrl, logger, "DBRule {} not exist", ruleUrl);
                    return null;
                }
            } else {
                throw new MalformedURLException("resource URL not supported: " + ruleUrl);
            }
        }
    }
}
