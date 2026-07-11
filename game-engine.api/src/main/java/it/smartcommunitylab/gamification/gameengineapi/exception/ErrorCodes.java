package it.smartcommunitylab.gamification.gameengineapi.exception;

public final class ErrorCodes {

    private ErrorCodes() {
    }

    // Generic
    public static final String GENERIC = "generic";
    public static final String DATA_ACCESS = "data_access";
    public static final String DUPLICATE_KEY = "duplicate_key";

    // Authentication / authorization
    public static final String AUTHENTICATION_FAILED = "authentication_failed";
    public static final String USER_NOT_AUTHENTICATED = "user_not_authenticated";
    public static final String USER_NOT_AUTHORIZED = "user_not_authorized";
    public static final String USER_NOT_ACTIVE = "user_not_active";
    public static final String USERNAME_ALREADY_TAKEN = "username_already_taken";

    // Validation
    public static final String VALIDATION = "validation";
    public static final String RULE_VALIDATION = "rule_validation";

    // Not found
    public static final String GAME_NOT_FOUND = "game_not_found";
    public static final String RULE_NOT_FOUND = "rule_not_found";
    public static final String ACTION_NOT_FOUND = "action_not_found";
    public static final String POINT_CONCEPT_NOT_FOUND = "point_concept_not_found";
    public static final String LEVEL_NOT_FOUND = "level_not_found";
    public static final String BADGE_NOT_FOUND = "badge_not_found";
    public static final String CHALLENGE_NOT_FOUND = "challenge_not_found";
    public static final String CHALLENGE_INSTANCE_NOT_FOUND = "challenge_instance_not_found";
    public static final String PLAYER_NOT_FOUND = "player_not_found";
    public static final String TEAM_NOT_FOUND = "team_not_found";
    public static final String SCENARIO_NOT_FOUND = "scenario_not_found";
    public static final String CLASSIFICATION_NOT_FOUND = "classification_not_found";

    // Creation / already exists
    public static final String GAME_CREATION = "game_creation";
    public static final String ACTION_CREATION = "action_creation";
    public static final String POINT_CONCEPT_CREATION = "point_concept_creation";
    public static final String BADGE_CREATION = "badge_creation";
    public static final String CHALLENGE_CREATION = "challenge_creation";
    public static final String TEAM_CREATION = "team_creation";
    public static final String SCENARIO_CREATION = "scenario_creation";
    public static final String CLASSIFICATION_CREATION = "classification_creation";

    // Execution / simulation
    public static final String GAME_EXECUTION_FAILED = "game_execution_failed";
    public static final String RULE_SIMULATION = "rule_simulation";

    // Import / export
    public static final String IMPORT_ERROR = "import_error";
    public static final String IMPORT_EMPTY = "import_empty";
    public static final String EXPORT_FORBIDDEN = "export_forbidden";

    // Teams
    public static final String INVALID_TEAM_MEMBERS = "invalid_team_members";

}
