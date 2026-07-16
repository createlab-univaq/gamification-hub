import type {GetClassificationBoardData} from "../api/types";

export const CHALLENGE_STATES = [
    "PROPOSED", "ASSIGNED", "ACTIVE", "COMPLETED", "FAILED", "REFUSED", "AUTO_DISCARDED", "CANCELED"
] as const

export type ChallengeState = typeof CHALLENGE_STATES[number];

export const ASSIGNABLE_CHALLENGE_STATES = ["ASSIGNED", "ACTIVE", "PROPOSED"] as const satisfies readonly ChallengeState[]

export const ChallengeStateChipColorRecord = {
    PROPOSED: "secondary.main",
    ASSIGNED: "secondary.light",
    ACTIVE: "success.main",
    COMPLETED: "success.dark",
    FAILED: "error.main",
    REFUSED: "error.light",
    AUTO_DISCARDED: "text.secondary",
    CANCELED: "text.disabled",
} satisfies Record<ChallengeState, string> as Record<ChallengeState, string>;

export const CHALLENGE_CHOICE_STATES = ["AVAILABLE", "ACTIVE"] as const

export type ChallengeChoiceState = typeof CHALLENGE_CHOICE_STATES[number];

export const ATTENDEE_ROLES = ["GUEST", "PROPOSER"] as const

export type AttendeeRole = typeof ATTENDEE_ROLES[number];

export type ClassificationScope = NonNullable<NonNullable<GetClassificationBoardData["query"]>["scope"]>

export const CLASSIFICATION_SCOPES: ClassificationScope[] = ["ALL", "PLAYERS", "TEAMS"]
