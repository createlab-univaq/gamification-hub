export const CHALLENGE_TYPES = ["ASSIGNED", "ACTIVE", "PROPOSED"] as const

export type ChallengeType = typeof CHALLENGE_TYPES[number];

export const ChallengeTypeChipColorRecord = {
    ACTIVE: "success.dark",
    PROPOSED: "secondary",
    ASSIGNED: "secondary.light",
} satisfies Record<ChallengeType, string> as Record<ChallengeType, string>;