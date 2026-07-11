import type {Block} from 'blockly'
import * as Blockly from 'blockly'
import {KNOWN_FACT_TYPES, KNOWN_IMPORTS} from '../../utils/builder-utils.ts'

function getBindings(block: Block): string[] {
    return block.workspace
        .getAllBlocks(false)
        .filter(b => b.type === 'drool_fact_pattern')
        .map(b => {
            const binding = b.getFieldValue("BINDING")
            if(binding) {
                return `$${binding}`.trim()
            }
            return ""
        })
        .filter(Boolean)
}

export const BLOCK_COLORS = {
    rule: '#6366F1',
    import: '#F59E0B',
    global: '#f5800b',
    condition: '#8B5CF6',
    constraint: '#EC4899',
    consequence: '#10B981',
    modify: '#059669',
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
    // ─── Package declaration ──────────────────────────────────────────────────
    {
        type: 'drool_package',
        message0: 'package %1',
        args0: [{type: 'field_input', name: 'PACKAGE', text: 'eu.trentorise.game.model'}],
        previousStatement: 'Import',
        nextStatement: 'Import',
        colour: BLOCK_COLORS.import,
        tooltip: 'Declare the package for this DRL file. Place at the top of the imports block.',
        helpUrl: '',
    },

    // ─── Imports group ────────────────────────────────────────────────────────
    {
        type: 'drool_imports',
        message0: 'imports',
        message1: '%1',
        args1: [{type: 'input_statement', name: 'IMPORTS', check: 'Import'}],
        colour: BLOCK_COLORS.import,
        tooltip: 'Container for all import statements.',
        helpUrl: '',
    },

    // ─── Import statement ─────────────────────────────────────────────────────
    {
        type: 'drool_import',
        message0: 'import %1',
        args0: [{
            type: 'field_suggestions',
            name: 'CLASS',
            text: 'eu.trentorise.game.model.PointConcept',
            suggestions: Object.values(KNOWN_IMPORTS)
        }],
        previousStatement: 'Import',
        nextStatement: 'Import',
        colour: BLOCK_COLORS.import,
        tooltip: 'A Java import statement.',
        helpUrl: '',
    },

    // ─── Globals group ────────────────────────────────────────────────────────
    {
        type: 'drool_globals',
        message0: 'globals',
        message1: '%1',
        args1: [{type: 'input_statement', name: 'GLOBALS', check: 'Global'}],
        colour: BLOCK_COLORS.global,
        tooltip: 'Container for all global declarations.',
        helpUrl: '',
    },

    // ─── Global declaration ───────────────────────────────────────────────────
    {
        type: 'drool_global',
        message0: 'global %1 %2',
        args0: [
            {type: 'field_input', name: 'TYPE', text: 'com.example.MyService'},
            {type: 'field_input', name: 'NAME', text: 'myService'},
        ],
        previousStatement: 'Global',
        nextStatement: 'Global',
        colour: BLOCK_COLORS.global,
        tooltip: 'Declare a global variable available to all rules.',
        helpUrl: '',
    },

    // ─── Rule root ────────────────────────────────────────────────────────────
    {
        type: 'drool_rule',
        message0: 'rule %1',
        args0: [{type: 'field_input', name: 'RULE_NAME'}],
        message1: '\nsalience %1 \n agenda-group %2 \n no-loop %3 \n lock-on-active %4',
        args1: [
            {type: 'field_number', name: 'SALIENCE', value: 0, precision: 1},
            {type: 'field_input', name: 'AGENDA_GROUP', text: ''},
            {type: 'field_checkbox', name: 'NO_LOOP', checked: false},
            {type: 'field_checkbox', name: 'ACTIVE_ON_LOCK', checked: false}
        ],
        message2: 'when %1',
        args2: [{type: 'input_statement', name: 'WHEN', check: 'Condition'}],
        message3: 'then %1',
        args3: [{type: 'input_statement', name: 'THEN', check: 'Consequence'}],
        colour: BLOCK_COLORS.rule,
        tooltip: 'A Drools rule with conditions (when) and consequences (then).',
        helpUrl: '',
    },

    // ─── Conditions ───────────────────────────────────────────────────────────

    {
        type: 'drool_fact_pattern',
        message0: 'binding: $%1   type: %2',
        args0: [
            {type: 'binding_input', name: 'BINDING', text: 'pc'},
            {type: 'field_suggestions', name: 'FACT_TYPE', text: 'PointConcept', suggestions: KNOWN_FACT_TYPES},
        ],
        message1: 'constraints %1',
        args1: [{type: 'input_statement', name: 'CONSTRAINTS', check: 'Constraint'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'A bound fact pattern with optional constraints.',
        helpUrl: '',
    },

    {
        type: 'drool_unbound_pattern',
        message0: 'type: %1',
        args0: [{type: 'field_suggestions', name: 'FACT_TYPE', text: 'PointConcept', suggestions: KNOWN_FACT_TYPES}],
        message1: 'constraints %1',
        args1: [{type: 'input_statement', name: 'CONSTRAINTS', check: 'Constraint'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'An unbound fact pattern (used inside not / exists).',
        helpUrl: '',
    },

    {
        type: 'drool_not',
        message0: 'not %1',
        args0: [{type: 'input_statement', name: 'CONDITION', check: 'Condition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Negation — matches when the inner condition does NOT hold.',
        helpUrl: '',
    },

    {
        type: 'drool_exists',
        message0: 'exists %1',
        args0: [{type: 'input_statement', name: 'CONDITION', check: 'Condition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Matches when at least one fact satisfies the inner condition.',
        helpUrl: '',
    },

    {
        type: 'drool_forall',
        message0: 'forall %1',
        args0: [{type: 'input_statement', name: 'CONDITION', check: 'Condition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Matches when ALL facts satisfy the inner condition.',
        helpUrl: '',
    },

    {
        type: 'drool_and_group',
        message0: 'AND group %1',
        args0: [{type: 'input_statement', name: 'CONDITIONS', check: 'Condition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Explicit AND grouping of conditions.',
        helpUrl: '',
    },

    {
        type: 'drool_or_group',
        message0: 'OR group %1',
        args0: [{type: 'input_statement', name: 'CONDITIONS', check: 'Condition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'OR grouping — fires when any one condition holds.',
        helpUrl: '',
    },

    {
        type: 'drool_from',
        message0: 'from %1',
        args0: [{type: 'field_input', name: 'EXPRESSION', text: '$collection'}],
        message1: 'pattern %1',
        args1: [{type: 'input_statement', name: 'PATTERN', check: 'Condition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'Matches a pattern drawn from a collection or expression.',
        helpUrl: '',
    },

    {
        type: 'drool_eval',
        message0: 'eval ( %1 )',
        args0: [{type: 'field_input', name: 'EXPRESSION', text: 'someCondition'}],
        previousStatement: 'Condition',
        nextStatement: 'Condition',
        colour: BLOCK_COLORS.condition,
        tooltip: 'An eval() condition with a boolean expression.',
        helpUrl: '',
    },

    {
        type: 'drool_raw_condition',
        message0: 'raw condition %1',
        args0: [{type: 'field_input', name: 'DRL', text: 'Object()'}],
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
            {type: 'field_input', name: 'FIELD', text: 'name'},
            {type: 'field_dropdown', name: 'OPERATOR', options: OPERATOR_OPTIONS},
            {type: 'field_input', name: 'VALUE', text: '"p1"'},
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
            {type: 'field_input', name: 'BINDING', text: '$val'},
            {type: 'field_input', name: 'FIELD', text: 'score'},
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
        args0: [{type: 'field_input', name: 'EXPRESSION', text: 'field != null'}],
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
        args0: [{
            type: 'field_suggestions',
            name: 'BINDING',
            text: '$pc',
            suggestions: (block: Block) => getBindings(block)
        }],
        message1: 'calls %1',
        args1: [{type: 'input_statement', name: 'METHODS', check: 'ModifyMethod'}],
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
            {type: 'field_input', name: 'METHOD', text: 'setScore'},
            {type: 'field_input', name: 'ARGS', text: '50'},
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
        args0: [{type: 'field_input', name: 'EXPRESSION', text: 'new Object()'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Insert a new fact into working memory.',
        helpUrl: '',
    },

    {
        type: 'drool_retract',
        message0: 'retract ( %1 )',
        args0: [{
            type: 'field_suggestions',
            name: 'BINDING',
            text: '$pc',
            suggestions: (block: Block) => getBindings(block)
        }],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Retract a bound fact from working memory.',
        helpUrl: '',
    },

    {
        type: 'drool_set_global',
        message0: 'global %1',
        args0: [{type: 'field_input', name: 'EXPRESSION', text: 'utils.log("msg")'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Call an expression on a global variable.',
        helpUrl: '',
    },

    {
        type: 'drool_raw_consequence',
        message0: 'code %1',
        args0: [{type: 'field_input', name: 'CODE', text: 'System.out.println("done");'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A raw Java/MVEL code consequence.',
        helpUrl: '',
    },

    {
        type: 'drool_declare',
        message0: 'declare %1',
        args0: [{type: 'field_input', name: 'CLASS_NAME', text: 'MyFact'}],
        message1: 'attributes %1',
        args1: [{type: 'input_statement', name: 'ATTRIBUTES', check: 'Attribute'}],
        colour: BLOCK_COLORS.rule,
        tooltip: 'Declare a custom Drools fact type with typed attributes.',
        helpUrl: '',
    },

    {
        type: 'drool_attribute',
        message0: '%1 : %2',
        args0: [
            {type: 'field_input', name: 'NAME', text: 'myField'},
            {type: 'field_input', name: 'TYPE', text: 'String'},
        ],
        previousStatement: 'Attribute',
        nextStatement: 'Attribute',
        colour: BLOCK_COLORS.constraint,
        tooltip: 'A typed attribute inside a declare block.',
        helpUrl: '',
    },

    {
        type: 'drool_function',
        message0: 'function %1 %2 ( %3 )',
        args0: [
            {type: 'field_input', name: 'RETURN_TYPE', text: 'void'},
            {type: 'field_input', name: 'NAME', text: 'myFunction'},
            {type: 'field_input', name: 'PARAMS', text: ''},
        ],
        message1: 'body %1',
        args1: [{type: 'input_statement', name: 'BODY', check: 'Consequence'}],
        colour: BLOCK_COLORS.rule,
        tooltip: 'A DRL helper function. The body uses the same consequence blocks as rule then-blocks.',
        helpUrl: '',
    },

    {
        type: 'drool_return',
        message0: 'return %1',
        args0: [{type: 'field_input', name: 'EXPRESSION', text: ''}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Return a value (or nothing for void functions).',
        helpUrl: '',
    },

    {
        type: 'drool_while',
        message0: 'while ( %1 )',
        args0: [{type: 'field_input', name: 'CONDITION', text: 'condition'}],
        message1: 'body %1',
        args1: [{type: 'input_statement', name: 'BODY', check: 'Consequence'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A while loop.',
        helpUrl: '',
    },

    {
        type: 'drool_for_each',
        message0: 'for ( %1 %2 : %3 )',
        args0: [
            {type: 'field_input', name: 'TYPE', text: 'Object'},
            {type: 'field_input', name: 'VAR_NAME', text: 'item'},
            {type: 'field_input', name: 'COLLECTION', text: '$collection'},
        ],
        message1: 'body %1',
        args1: [{type: 'input_statement', name: 'BODY', check: 'Consequence'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'An enhanced for-each loop over a collection.',
        helpUrl: '',
    },

    {
        type: 'drool_for',
        message0: 'for ( %1 ; %2 ; %3 )',
        args0: [
            {type: 'field_input', name: 'INIT', text: 'int i = 0'},
            {type: 'field_input', name: 'CONDITION', text: 'i < n'},
            {type: 'field_input', name: 'UPDATE', text: 'i++'},
        ],
        message1: 'body %1',
        args1: [{type: 'input_statement', name: 'BODY', check: 'Consequence'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A classic for loop.',
        helpUrl: '',
    },

    {
        type: 'drool_var_decl',
        message0: 'instantiate %1 %2 = %3',
        args0: [
            {type: 'field_input', name: 'TYPE', text: 'String'},
            {type: 'field_input', name: 'NAME', text: 'myVar'},
            {type: 'field_input', name: 'VALUE', text: 'new String()'},
        ],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Declare and initialise a local variable.',
        helpUrl: '',
    },

    {
        type: 'drool_method_call',
        message0: 'call %1 . %2 ( %3 )',
        args0: [
            {type: 'field_input', name: 'OBJECT', text: '$obj'},
            {type: 'field_input', name: 'METHOD', text: 'method'},
            {type: 'field_input', name: 'ARGS', text: ''},
        ],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'Call a method on a variable.',
        helpUrl: '',
    },

    {
        type: 'drool_switch',
        message0: 'switch ( %1 )',
        args0: [{type: 'field_input', name: 'EXPRESSION', text: '$variable'}],
        message1: 'cases %1',
        args1: [{type: 'input_statement', name: 'CASES', check: 'SwitchCase'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A switch block. Add case and default blocks inside.',
        helpUrl: '',
    },

    {
        type: 'drool_case',
        message0: 'case %1',
        args0: [{type: 'field_input', name: 'VALUE', text: '"value"'}],
        message1: 'body %1',
        args1: [{type: 'input_statement', name: 'BODY', check: 'Consequence'}],
        previousStatement: 'SwitchCase',
        nextStatement: 'SwitchCase',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A case inside a switch block.',
        helpUrl: '',
    },

    {
        type: 'drool_default',
        message0: 'default',
        message1: 'body %1',
        args1: [{type: 'input_statement', name: 'BODY', check: 'Consequence'}],
        previousStatement: 'SwitchCase',
        nextStatement: 'SwitchCase',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'The default case inside a switch block.',
        helpUrl: '',
    },

    {
        type: 'drool_if',
        message0: 'if ( %1 )',
        args0: [{type: 'field_input', name: 'CONDITION', text: 'condition'}],
        message1: 'then %1',
        args1: [{type: 'input_statement', name: 'THEN', check: 'Consequence'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A conditional if block.',
        helpUrl: '',
    },

    {
        type: 'drool_if_else',
        message0: 'if ( %1 )',
        args0: [{type: 'field_input', name: 'CONDITION', text: 'condition'}],
        message1: 'then %1',
        args1: [{type: 'input_statement', name: 'THEN', check: 'Consequence'}],
        message2: 'else %1',
        args2: [{type: 'input_statement', name: 'ELSE', check: 'Consequence'}],
        previousStatement: 'Consequence',
        nextStatement: 'Consequence',
        colour: BLOCK_COLORS.consequence,
        tooltip: 'A conditional if/else block.',
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
