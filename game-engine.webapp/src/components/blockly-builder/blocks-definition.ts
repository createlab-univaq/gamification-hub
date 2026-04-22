import * as Blockly from 'blockly'
import {KNOWN_FACT_TYPES, KNOWN_IMPORTS} from '../rule-builder/utils'

export const BLOCK_COLORS = {
    rule:        '#6366F1', // indigo
    import:      '#F59E0B', // amber
    condition:   '#8B5CF6', // violet
    constraint:  '#EC4899', // pink
    consequence: '#10B981', // emerald
    modify:      '#059669', // darker emerald — method calls inside modify
} as const


const OPERATOR_OPTIONS: [string, string][] = [
    ['==', '=='],
    ['!=', '!='],
    ['>', '>'],
    ['<', '<'],
    ['>=', '>='],
    ['<=', '<='],
    ['contains', 'contains'],
    ['not contains', 'not contains'],
    ['memberOf', 'memberOf'],
    ['not memberOf', 'not memberOf'],
    ['matches', 'matches'],
    ['not matches', 'not matches'],
]

const BLOCK_DEFS = [
    // ─── Import statement ─────────────────────────────────────────────────────
    {
        type: 'drool_import',
        message0: 'import %1',
        args0: [{ type: 'field_suggestions', name: 'CLASS', text: 'eu.trentorise.game.model.PointConcept', suggestions: Object.values(KNOWN_IMPORTS) }],
        previousStatement: 'Import',
        nextStatement: 'Import',
        colour: BLOCK_COLORS.import,
        tooltip: 'A Java import statement.',
        helpUrl: '',
    },

    // ─── Rule root ────────────────────────────────────────────────────────────
    {
        type: 'drool_rule',
        message0: 'rule %1',
        args0: [{ type: 'field_input', name: 'RULE_NAME', text: 'my_rule' }],
        message1: '\nsalience %1 \n agenda-group %2 \n no-loop %3 \n lock-on-active %4',
        args1: [
            { type: 'field_number', name: 'SALIENCE', value: 0, precision: 1 },
            { type: 'field_input', name: 'AGENDA_GROUP', text: '' },
            { type: 'field_checkbox', name: 'NO_LOOP', checked: false },
            { type: 'field_checkbox', name: 'ACTIVE_ON_LOCK', checked: false }
        ],
        message2: 'imports %1',
        args2: [{ type: 'input_statement', name: 'IMPORTS', check: 'Import' }],
        message3: 'when %1',
        args3: [{ type: 'input_statement', name: 'WHEN', check: 'Condition' }],
        message4: 'then %1',
        args4: [{ type: 'input_statement', name: 'THEN', check: 'Consequence' }],
        colour: BLOCK_COLORS.rule,
        tooltip: 'A Drools rule with conditions (when) and consequences (then).',
        helpUrl: '',
    },

    // ─── Conditions ───────────────────────────────────────────────────────────

    {
        type: 'drool_fact_pattern',
        message0: 'binding: %1   type: %2',
        args0: [
            { type: 'field_input', name: 'BINDING', text: '$pc' },
            { type: 'field_suggestions', name: 'FACT_TYPE', text: 'PointConcept', suggestions: KNOWN_FACT_TYPES },
        ],
        message1: 'constraints %1',
        args1: [{ type: 'input_statement', name: 'CONSTRAINTS', check: 'Constraint' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'A bound fact pattern with optional constraints.',
        helpUrl: '',
    },

    {
        type: 'drool_unbound_pattern',
        message0: 'type: %1',
        args0: [{ type: 'field_suggestions', name: 'FACT_TYPE', text: 'PointConcept', suggestions: KNOWN_FACT_TYPES }],
        message1: 'constraints %1',
        args1: [{ type: 'input_statement', name: 'CONSTRAINTS', check: 'Constraint' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'An unbound fact pattern (used inside not / exists).',
        helpUrl: '',
    },

    {
        type: 'drool_not',
        message0: 'not %1',
        args0: [{ type: 'input_statement', name: 'CONDITION', check: 'Condition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Negation — matches when the inner condition does NOT hold.',
        helpUrl: '',
    },

    {
        type: 'drool_exists',
        message0: 'exists %1',
        args0: [{ type: 'input_statement', name: 'CONDITION', check: 'Condition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Matches when at least one fact satisfies the inner condition.',
        helpUrl: '',
    },

    {
        type: 'drool_forall',
        message0: 'forall %1',
        args0: [{ type: 'input_statement', name: 'CONDITION', check: 'Condition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Matches when ALL facts satisfy the inner condition.',
        helpUrl: '',
    },

    {
        type: 'drool_and_group',
        message0: 'AND group %1',
        args0: [{ type: 'input_statement', name: 'CONDITIONS', check: 'Condition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Explicit AND grouping of conditions.',
        helpUrl: '',
    },

    {
        type: 'drool_or_group',
        message0: 'OR group %1',
        args0: [{ type: 'input_statement', name: 'CONDITIONS', check: 'Condition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'OR grouping — fires when any one condition holds.',
        helpUrl: '',
    },

    {
        type: 'drool_from',
        message0: 'from %1',
        args0: [{ type: 'field_input', name: 'EXPRESSION', text: '$collection' }],
        message1: 'pattern %1',
        args1: [{ type: 'input_statement', name: 'PATTERN', check: 'Condition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Matches a pattern drawn from a collection or expression.',
        helpUrl: '',
    },

    {
        type: 'drool_eval',
        message0: 'eval ( %1 )',
        args0: [{ type: 'field_input', name: 'EXPRESSION', text: 'someCondition' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'An eval() condition with a boolean expression.',
        helpUrl: '',
    },

    {
        type: 'drool_raw_condition',
        message0: 'raw condition %1',
        args0: [{ type: 'field_input', name: 'DRL', text: 'Object()' }],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'A raw DRL condition inserted verbatim.',
        helpUrl: '',
    },

    // ─── Constraints ──────────────────────────────────────────────────────────

    {
        type: 'drool_field_constraint',
        message0: '%1 %2 %3',
        args0: [
            { type: 'field_input', name: 'FIELD', text: 'name' },
            { type: 'field_dropdown', name: 'OPERATOR', options: OPERATOR_OPTIONS },
            { type: 'field_input', name: 'VALUE', text: '"p1"' },
        ],
        previousStatement: 'Constraint',
        nextStatement: 'Constraint',
        colour: BLOCK_COLORS.constraint,
        tooltip: 'A field constraint: field operator value.',
        helpUrl: '',
    },

    {
        type: 'drool_binding_constraint',
        message0: '%1 : %2',
        args0: [
            { type: 'field_input', name: 'BINDING', text: '$val' },
            { type: 'field_input', name: 'FIELD', text: 'score' },
        ],
        previousStatement: 'Constraint',
        nextStatement: 'Constraint',
        colour: BLOCK_COLORS.constraint,
        tooltip: 'A binding constraint: $var : field.',
        helpUrl: '',
    },

    {
        type: 'drool_raw_constraint',
        message0: 'raw %1',
        args0: [{ type: 'field_input', name: 'EXPRESSION', text: 'field != null' }],
        previousStatement: 'Constraint',
        nextStatement: 'Constraint',
        colour: BLOCK_COLORS.constraint,
        tooltip: 'A raw constraint expression inserted verbatim.',
        helpUrl: '',
    },

    // ─── Consequences ─────────────────────────────────────────────────────────

    {
        type: 'drool_modify',
        message0: 'modify %1',
        args0: [{ type: 'field_input', name: 'BINDING', text: '$pc' }],
        message1: 'calls %1',
        args1: [{ type: 'input_statement', name: 'METHODS', check: 'ModifyMethod' }],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Modify a bound fact by calling setter methods.',
        helpUrl: '',
    },

    {
        type: 'drool_modify_method',
        message0: 'call %1 ( %2 )',
        args0: [
            { type: 'field_input', name: 'METHOD', text: 'setScore' },
            { type: 'field_input', name: 'ARGS', text: '50' },
        ],
        previousStatement: 'ModifyMethod',
        nextStatement: 'ModifyMethod',
        colour: BLOCK_COLORS.modify,
        tooltip: 'A method call inside a modify block. Separate multiple args with commas.',
        helpUrl: '',
    },

    {
        type: 'drool_insert',
        message0: 'insert ( %1 )',
        args0: [{ type: 'field_input', name: 'EXPRESSION', text: 'new Object()' }],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Insert a new fact into working memory.',
        helpUrl: '',
    },

    {
        type: 'drool_retract',
        message0: 'retract ( %1 )',
        args0: [{ type: 'field_input', name: 'BINDING', text: '$pc' }],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Retract a bound fact from working memory.',
        helpUrl: '',
    },

    {
        type: 'drool_set_global',
        message0: 'global %1',
        args0: [{ type: 'field_input', name: 'EXPRESSION', text: 'utils.log("msg")' }],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Call an expression on a global variable.',
        helpUrl: '',
    },

    {
        type: 'drool_raw_consequence',
        message0: 'code %1',
        args0: [{ type: 'field_input', name: 'CODE', text: 'System.out.println("done");' }],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A raw Java/MVEL code consequence.',
        helpUrl: '',
    },
]

export function registerBlockDefinitions(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unregistered = (BLOCK_DEFS as any[]).filter(def => !(def.type in Blockly.Blocks))
    if (unregistered.length) {
        Blockly.defineBlocksWithJsonArray(unregistered)
    }
}
