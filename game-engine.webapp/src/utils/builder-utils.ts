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

export function parseValue(value: string): unknown {
    if (value === "true") return true;
    if (value === "false") return false;
    const n = Number(value);
    if (value !== "" && !isNaN(n)) return n;
    return value;
}
