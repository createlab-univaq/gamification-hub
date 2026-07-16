package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import eu.trentorise.game.core.TaskSchedule;
import eu.trentorise.game.managers.ClassificationUtils;
import eu.trentorise.game.model.Game;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.PointConcept.PeriodInstance;
import eu.trentorise.game.model.core.ClassificationPosition;
import eu.trentorise.game.model.core.GameTask;
import eu.trentorise.game.repo.GamePersistence;
import eu.trentorise.game.repo.GameRepo;
import eu.trentorise.game.services.GameService;
import eu.trentorise.game.services.PlayerService;
import eu.trentorise.game.services.TaskService;
import eu.trentorise.game.task.ClassificationTask;
import eu.trentorise.game.task.GeneralClassificationTask;
import eu.trentorise.game.task.IncrementalClassificationTask;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityCreationException;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.criteria.ClassificationCriteria;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationBoardDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationScope;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.ClassificationType;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.ClassificationMapper;
import it.smartcommunitylab.gamification.gameengineapi.service.ClassificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClassificationServiceImpl implements ClassificationService {

    private final GameRepo gameRepo;
    private final GameService gameService;
    private final PlayerService playerService;
    private final TaskService taskService;
    private final ClassificationMapper classificationMapper;

    @Override
    public List<ClassificationDTO> get(String gameId, ClassificationCriteria criteria) {
        String nameRegex = StringUtils.isBlank(criteria.getName()) ? ".*" : Pattern.quote(criteria.getName());
        return readClassifications(gameId, nameRegex).stream()
                .map(classificationMapper::toDTO)
                .peek(dto -> dto.setGameId(gameId))
                .toList();
    }

    @Override
    public ClassificationDTO get(String gameId, String classificationId) {
        ClassificationTask task = readClassifications(gameId, "^" + Pattern.quote(classificationId) + "$").stream()
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Classification", classificationId,
                        ErrorCodes.CLASSIFICATION_NOT_FOUND));
        ClassificationDTO dto = classificationMapper.toDTO(task);
        dto.setGameId(gameId);
        return dto;
    }

    @Override
    public ClassificationDTO create(ClassificationDTO classificationDTO) {
        if (StringUtils.isBlank(classificationDTO.getName()) || classificationDTO.getType() == null) {
            throw new RequestException("Invalid classification", "Classification name and type are required",
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
        Game game = loadGameOrThrow(classificationDTO.getGameId());
        if (game.getTasks() == null) {
            game.setTasks(new HashSet<GameTask>());
        }
        boolean exists = game.getTasks().stream()
                .anyMatch(task -> classificationDTO.getName().equals(task.getName()));
        if (exists) {
            throw new EntityCreationException("Classification",
                    "A task named %s already exists in game %s".formatted(classificationDTO.getName(), game.getId()),
                    ErrorCodes.CLASSIFICATION_CREATION);
        }
        ClassificationTask task = buildTask(game, classificationDTO);
        game.getTasks().add(task);
        gameService.saveGameDefinition(game);
        taskService.createTask(task, game);
        log.info("Created {} classification {} in game {}", classificationDTO.getType(),
                classificationDTO.getName(), game.getId());
        ClassificationDTO saved = classificationMapper.toDTO(task);
        saved.setGameId(game.getId());
        return saved;
    }

    @Override
    public ClassificationDTO update(ClassificationDTO classificationDTO) {
        Game game = loadGameOrThrow(classificationDTO.getGameId());
        ClassificationTask task = findTask(game, classificationDTO.getId());
        if (classificationDTO.getType() != null && classificationDTO.getType() != classificationMapper.typeOf(task)) {
            throw new RequestException("Invalid classification",
                    "The type of an existing classification cannot be changed",
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
        if (classificationDTO.getItemsToNotificate() != null) {
            task.setItemsToNotificate(classificationDTO.getItemsToNotificate());
        }
        if (task instanceof GeneralClassificationTask generalTask) {
            if (StringUtils.isNotBlank(classificationDTO.getPointConceptName())) {
                generalTask.setItemType(classificationDTO.getPointConceptName());
            }
            if (StringUtils.isNotBlank(classificationDTO.getCronExpression())) {
                TaskSchedule schedule = Objects.requireNonNullElseGet(generalTask.getSchedule(), TaskSchedule::new);
                schedule.setCronExpression(classificationDTO.getCronExpression());
                generalTask.setSchedule(schedule);
            }
        } else if (task instanceof IncrementalClassificationTask incrementalTask) {
            String pointConceptName = StringUtils.defaultIfBlank(classificationDTO.getPointConceptName(),
                    incrementalTask.getPointConceptName());
            String periodName = StringUtils.defaultIfBlank(classificationDTO.getPeriodName(),
                    incrementalTask.getPeriodName());
            if (!pointConceptName.equals(incrementalTask.getPointConceptName())
                    || !periodName.equals(incrementalTask.getPeriodName())) {
                incrementalTask.updatePointConceptData(findPointConcept(game, pointConceptName), periodName, null);
            }
        }
        gameService.saveGameDefinition(game);
        taskService.updateTask(task, game);
        log.info("Updated classification {} of game {}", task.getName(), game.getId());
        ClassificationDTO updated = classificationMapper.toDTO(task);
        updated.setGameId(game.getId());
        return updated;
    }

    @Override
    public void delete(String gameId, String classificationId) {
        Game game = loadGameOrThrow(gameId);
        ClassificationTask task = findTask(game, classificationId);
        game.getTasks().remove(task);
        gameService.saveGameDefinition(game);
        taskService.destroyTask(task, game);
        log.info("Deleted classification {} of game {}", classificationId, gameId);
    }

    @Override
    public ClassificationBoardDTO getBoard(String gameId, String classificationId, long timestamp,
            int periodInstanceIndex, ClassificationScope scope, Pageable pageable) {
        if (timestamp > -1 && periodInstanceIndex > -1) {
            throw new RequestException("Invalid board request",
                    "Cannot use both timestamp and periodInstanceIndex parameters in the same request",
                    ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
        }
        Game game = loadGameOrThrow(gameId);
        ClassificationTask task = findTask(game, classificationId);

        eu.trentorise.game.model.core.ClassificationScope engineScope =
                eu.trentorise.game.model.core.ClassificationScope.valueOf(
                        Objects.requireNonNullElse(scope, ClassificationScope.ALL).name());

        Page<ClassificationPosition> board;
        if (task instanceof IncrementalClassificationTask incrementalTask) {
            long moment = timestamp > -1 ? timestamp
                    : (periodInstanceIndex > -1 ? -1 : System.currentTimeMillis());
            PeriodInstance instance = ClassificationUtils.retrieveWindow(game,
                    incrementalTask.getPeriodName(), incrementalTask.getPointConceptName(), moment,
                    periodInstanceIndex);
            if (instance == null) {
                throw new RequestException("Invalid board request",
                        "No period instance found for the requested window",
                        ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
            }
            String key = ClassificationUtils.generateKey(instance);
            log.info("Computing incremental board for classification {} of game {} on window {} scope {}",
                    classificationId, gameId, key, engineScope);
            board = playerService.classifyPlayerStatesWithKey(timestamp,
                    incrementalTask.getPointConceptName(), incrementalTask.getPeriodName(), key, game.getId(),
                    engineScope, pageable);
        } else {
            log.info("Computing general board for classification {} of game {} scope {}", classificationId, gameId,
                    engineScope);
            board = playerService.classifyAllPlayerStates(game,
                    ((GeneralClassificationTask) task).getItemType(), engineScope, pageable);
        }

        return classificationMapper.toBoardDTO(task, board);
    }

    private List<ClassificationTask> readClassifications(String gameId, String nameRegex) {
        GamePersistence persistedGame = gameRepo.findTasksByGameIdAndName(gameId, nameRegex);
        if (persistedGame == null) {
            throw new EntityNotFoundException("Game", gameId, ErrorCodes.GAME_NOT_FOUND);
        }
        return persistedGame.toGame().getTasks().stream()
                .filter(task -> task instanceof ClassificationTask)
                .map(task -> (ClassificationTask) task)
                .toList();
    }

    private ClassificationTask buildTask(Game game, ClassificationDTO classificationDTO) {
        int itemsToNotificate = Objects.requireNonNullElse(classificationDTO.getItemsToNotificate(), 3);
        if (classificationDTO.getType() == ClassificationType.GENERAL) {
            if (StringUtils.isBlank(classificationDTO.getCronExpression())) {
                throw new RequestException("Invalid classification",
                        "A general classification requires a cron expression",
                        ErrorCodes.VALIDATION, HttpStatus.BAD_REQUEST);
            }
            TaskSchedule schedule = new TaskSchedule();
            schedule.setCronExpression(classificationDTO.getCronExpression());
            return new GeneralClassificationTask(schedule, itemsToNotificate,
                    classificationDTO.getPointConceptName(), classificationDTO.getName());
        }
        IncrementalClassificationTask task = new IncrementalClassificationTask();
        task.setName(classificationDTO.getName());
        task.setClassificationName(classificationDTO.getName());
        task.setItemsToNotificate(itemsToNotificate);
        task.updatePointConceptData(findPointConcept(game, classificationDTO.getPointConceptName()),
                classificationDTO.getPeriodName(), null);
        return task;
    }

    private PointConcept findPointConcept(Game game, String pointConceptName) {
        return gameService.readConceptInstances(game.getId()).stream()
                .filter(concept -> concept instanceof PointConcept && concept.getName().equals(pointConceptName))
                .map(concept -> (PointConcept) concept)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("PointConcept", pointConceptName,
                        ErrorCodes.POINT_CONCEPT_NOT_FOUND));
    }

    private Game loadGameOrThrow(String gameId) {
        Game game = gameService.loadGameDefinitionById(gameId);
        if (game == null) {
            throw new EntityNotFoundException("Game", gameId, ErrorCodes.GAME_NOT_FOUND);
        }
        return game;
    }

    private ClassificationTask findTask(Game game, String classificationId) {
        return Objects.requireNonNullElse(game.getTasks(), new HashSet<GameTask>()).stream()
                .filter(task -> task instanceof ClassificationTask && classificationId.equals(task.getName()))
                .map(task -> (ClassificationTask) task)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Classification", classificationId,
                        ErrorCodes.CLASSIFICATION_NOT_FOUND));
    }

}
