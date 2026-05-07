import type {Abstract} from "blockly/core/events/events_abstract";
import type {WorkspaceSvg} from "blockly";
import {drlGenerator} from "../components/blockly-builder/drl-generator.ts";

/** Ensures a binding variable always starts with $ */
export const normalizeBinding = (value: string): string => {
    if (!value) return value
    return value.startsWith('$') ? value : `$${value}`
}

export function isUpdateEvent(event:Abstract) {
    return !event.isUiEvent && event.type != "finished_loading" && event.type != "click"
}

export function getRuleNameFromBlock(workspace:WorkspaceSvg) {
    const topBlock = workspace.getTopBlocks(true)[0]
    if(topBlock.type != "drool_rule"){
        return ""
    }
    return topBlock.getFieldValue("RULE_NAME")
}

const FILE_BLOCK_TYPES = new Set([
    'drool_imports', 'drool_import',
    'drool_globals', 'drool_global',
    'drool_declare', 'drool_function',
])

export function layoutWorkspace(workspace: WorkspaceSvg): void {
    const H_GAP = 30
    const V_GAP = 80
    const START_X = 20
    const START_Y = 20

    const top = workspace.getTopBlocks(true)
    const fileBlocks = top.filter(b => FILE_BLOCK_TYPES.has(b.type))
    const ruleBlocks = top.filter(b => b.type === 'drool_rule')
    const other      = top.filter(b => !FILE_BLOCK_TYPES.has(b.type) && b.type !== 'drool_rule')

    const placeRow = (blocks: ReturnType<WorkspaceSvg['getTopBlocks']>, x0: number, y0: number): number => {
        let x = x0
        let maxH = 0
        for (const block of blocks) {
            const rect = block.getBoundingRectangle()
            const w = rect.right  - rect.left
            const h = rect.bottom - rect.top
            block.moveBy(x - rect.left, y0 - rect.top)
            x += w + H_GAP
            maxH = Math.max(maxH, h)
        }
        return maxH
    }

    let y = START_Y
    if (fileBlocks.length) {
        y += placeRow(fileBlocks, START_X, y) + V_GAP
    }
    if (ruleBlocks.length) {
        y += placeRow(ruleBlocks, START_X, y) + V_GAP
    }
    if (other.length) {
        placeRow(other, START_X, y)
    }
}

export function parseValue(value: string): unknown {
    if (value === "true") return true;
    if (value === "false") return false;
    const n = Number(value);
    if (value !== "" && !isNaN(n)) return n;
    return value;
}

export const KNOWN_FACT_TYPES: string[] = [
    'Action',
    'InputData',
    'PointConcept',
    'BadgeCollectionConcept',
    'ChallengeConcept',
    'CustomData',
    'Player',
    'Game',
    'GroupChallenge',
    'Reward',
]

// Maps known fact types to their fully qualified Java class names.
export const KNOWN_IMPORTS: Record<string, string> = {
    Action:                  'eu.trentorise.game.model.Action',
    InputData:               'eu.trentorise.game.model.InputData',
    PointConcept:            'eu.trentorise.game.model.PointConcept',
    BadgeCollectionConcept:  'eu.trentorise.game.model.BadgeCollectionConcept',
    ChallengeConcept:        'eu.trentorise.game.model.ChallengeConcept',
    CustomData:              'eu.trentorise.game.model.CustomData',
    Player:                  'eu.trentorise.game.model.Player',
    Game:                    'eu.trentorise.game.model.Game',
    GroupChallenge:          'eu.trentorise.game.model.GroupChallenge',
    Reward:                  'eu.trentorise.game.model.Reward',
}
