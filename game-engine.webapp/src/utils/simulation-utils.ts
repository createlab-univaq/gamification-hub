import type {
    PlayerStateDto,
    SimulationRequestDto,
    SimulationScenarioDto,
    SyntheticStateDto
} from "../api/types";
import {parseValue} from "./builder-utils.ts";
import {toDateTimeInput, toIsoDate} from "./date-utils.ts";

// ── Form shape ────────────────────────────────────────────────────────────────

export type KVRow = { key: string; value: string }
export type PointConceptRow = { name: string; score: string }
export type BadgeCollectionRow = { name: string; badges: string[] }
export type ChallengeRow = { name: string; modelName: string; state: string; fields: KVRow[] }

export type SimulationFormValues = {
    name: string
    executionMoment: string
    actionIds: { value: string }[]
    pointConcepts: PointConceptRow[]
    badgeCollections: BadgeCollectionRow[]
    challenges: ChallengeRow[]
    customData: KVRow[]
    data: KVRow[]
    expectedPointConcepts: PointConceptRow[]
    expectedBadgeCollections: BadgeCollectionRow[]
    expectedChallenges: ChallengeRow[]
}

export function emptySimulationForm(): SimulationFormValues {
    return {
        name: "",
        executionMoment: "",
        actionIds: [],
        pointConcepts: [],
        badgeCollections: [],
        challenges: [],
        customData: [],
        data: [],
        expectedPointConcepts: [],
        expectedBadgeCollections: [],
        expectedChallenges: [],
    }
}

// ── Form ↔ API ────────────────────────────────────────────────────────────────

function toFieldMap(rows: KVRow[]) {
    return rows.length
        ? Object.fromEntries(rows.filter(row => row.key).map(row => [row.key, parseValue(row.value)]))
        : undefined
}

function toChallengePayload(rows: ChallengeRow[]) {
    return rows
        .filter(challenge => challenge.name)
        .map(challenge => ({
            name: challenge.name,
            modelName: challenge.modelName || undefined,
            state: challenge.state || undefined,
            fields: toFieldMap(challenge.fields),
        }))
}

function toBadgePayload(rows: BadgeCollectionRow[]) {
    return rows
        .filter(collection => collection.name)
        .map(collection => ({
            name: collection.name,
            badges: (collection.badges ?? []).map(badge => badge.trim()).filter(Boolean)
        }))
}

function toPointPayload(rows: PointConceptRow[]) {
    return rows
        .filter(concept => concept.name)
        .map(concept => ({name: concept.name, score: parseFloat(concept.score) || 0}))
}

export function buildRequest(gameId: string, values: SimulationFormValues): SimulationRequestDto {
    return {
        gameId,
        syntheticState: {
            actionIds: values.actionIds.map(action => action.value).filter(Boolean),
            pointConcepts: toPointPayload(values.pointConcepts),
            badgeCollections: toBadgePayload(values.badgeCollections),
            challenges: toChallengePayload(values.challenges),
            customData: toFieldMap(values.customData),
        },
        data: toFieldMap(values.data),
        executionMoment: values.executionMoment ? toIsoDate(values.executionMoment) : undefined,
        showDetailedChanges: true,
    }
}

export function buildExpectedState(values: SimulationFormValues): SyntheticStateDto {
    return {
        pointConcepts: toPointPayload(values.expectedPointConcepts),
        badgeCollections: toBadgePayload(values.expectedBadgeCollections),
        challenges: toChallengePayload(values.expectedChallenges),
    }
}

function toChallengeRows(challenges: SyntheticStateDto["challenges"]): ChallengeRow[] {
    return (challenges ?? []).map(challenge => ({
        name: challenge.name ?? "",
        modelName: challenge.modelName ?? "",
        state: challenge.state ?? "",
        fields: Object.entries(challenge.fields ?? {}).map(([key, value]) => ({key, value: String(value)}))
    }))
}

function toBadgeRows(collections: SyntheticStateDto["badgeCollections"]): BadgeCollectionRow[] {
    return (collections ?? []).map(collection => ({
        name: collection.name ?? "",
        badges: collection.badges ?? []
    }))
}

function toPointRows(concepts: SyntheticStateDto["pointConcepts"]): PointConceptRow[] {
    return (concepts ?? []).map(concept => ({name: concept.name ?? "", score: String(concept.score ?? 0)}))
}

export function toFormValues(scenario: SimulationScenarioDto): SimulationFormValues {
    const state = scenario.syntheticState ?? {}
    const expected = scenario.expectedOutput ?? {}
    return {
        ...emptySimulationForm(),
        name: scenario.name ?? "",
        executionMoment: scenario.executionMoment ? toDateTimeInput(scenario.executionMoment) : "",
        actionIds: (state.actionIds ?? []).map(value => ({value})),
        pointConcepts: toPointRows(state.pointConcepts),
        badgeCollections: toBadgeRows(state.badgeCollections),
        challenges: toChallengeRows(state.challenges),
        customData: Object.entries(state.customData ?? {}).map(([key, value]) => ({key, value: String(value)})),
        expectedPointConcepts: toPointRows(expected.pointConcepts),
        expectedBadgeCollections: toBadgeRows(expected.badgeCollections),
        expectedChallenges: toChallengeRows(expected.challenges),
    }
}

// ── Expectations ──────────────────────────────────────────────────────────────

// The outcome of checking one expected value against the last simulation. It is captured when the
// run finishes rather than recomputed while rendering, so editing an expectation afterwards cannot
// silently claim a result for a value that was never simulated.
export interface ExpectationVerdict {
    // False when nothing by that name came back in the final state at all.
    found: boolean
    passed: boolean
    expected: string
    actual: string
}

export interface ExpectationVerdicts {
    pointConcepts: Record<string, ExpectationVerdict>
    badgeCollections: Record<string, ExpectationVerdict>
    challenges: Record<string, ExpectationVerdict>
}

export function allExpectationsPassed(verdicts: ExpectationVerdicts) {
    return [verdicts.pointConcepts, verdicts.badgeCollections, verdicts.challenges]
        .flatMap(section => Object.values(section))
        .every(verdict => verdict.passed)
}

function describeChallenge(modelName?: string, state?: string, fields: string[] = []) {
    return [modelName, state, ...fields].filter(Boolean).join(" · ")
}

// Checks every expected value against the result and records why each one passed or failed. The
// summary verdict is derived from these, so the icon on the section header can never disagree with
// the icons on the individual rows.
export function evaluateExpectations(values: SimulationFormValues,
                                     finalState?: PlayerStateDto): ExpectationVerdicts | null {
    const pcs = values.expectedPointConcepts.filter(r => r.name)
    const bcs = values.expectedBadgeCollections.filter(r => r.name)
    const chs = values.expectedChallenges.filter(r => r.name)
    if ((!pcs.length && !bcs.length && !chs.length) || !finalState) {
        return null
    }

    const verdicts: ExpectationVerdicts = {pointConcepts: {}, badgeCollections: {}, challenges: {}}

    for (const pc of pcs) {
        const actual = finalState.pointConcepts?.find(a => a.name === pc.name)
        const expected = parseFloat(pc.score) || 0
        verdicts.pointConcepts[pc.name] = {
            found: !!actual,
            passed: !!actual && (actual.score ?? 0) === expected,
            expected: String(expected),
            actual: actual ? String(actual.score ?? 0) : ""
        }
    }

    for (const bc of bcs) {
        const actual = finalState.badgeCollections?.find(a => a.name === bc.name)
        const expected = (bc.badges ?? []).map(b => b.trim()).filter(Boolean)
        verdicts.badgeCollections[bc.name] = {
            found: !!actual,
            passed: !!actual && expected.every(b => actual.badges?.includes(b)),
            expected: expected.join(", "),
            actual: (actual?.badges ?? []).join(", ")
        }
    }

    for (const ch of chs) {
        const actual = finalState.challenges?.find(a => a.name === ch.name)
        const fields = ch.fields.filter(r => r.key)
        verdicts.challenges[ch.name] = {
            found: !!actual,
            passed: !!actual
                && (!ch.modelName || actual.modelName === ch.modelName)
                && (!ch.state || actual.state === ch.state)
                && fields.every(f => actual.fields?.[f.key] === parseValue(f.value)),
            expected: describeChallenge(ch.modelName, ch.state, fields.map(f => `${f.key}=${f.value}`)),
            actual: actual
                ? describeChallenge(actual.modelName, actual.state,
                    Object.entries(actual.fields ?? {}).map(([key, value]) => `${key}=${value}`))
                : ""
        }
    }

    return verdicts
}
