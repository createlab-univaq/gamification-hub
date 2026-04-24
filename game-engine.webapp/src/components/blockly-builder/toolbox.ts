import { BLOCK_COLORS } from './blocks-definition.ts'

export const TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Rules',
            colour: String(BLOCK_COLORS.rule),
            contents: [
                { kind: 'block', type: 'drool_rule' },
            ],
        },
        {
            kind: 'category',
            name: 'Imports',
            colour: String(BLOCK_COLORS.import),
            contents: [
                { kind: 'block', type: 'drool_import' },
                { kind: 'block', type: 'drool_global' },
            ],
        },
        {
            kind: 'category',
            name: 'Conditions',
            colour: String(BLOCK_COLORS.condition),
            contents: [
                { kind: 'block', type: 'drool_fact_pattern' },
                { kind: 'block', type: 'drool_unbound_pattern' },
                { kind: 'block', type: 'drool_not' },
                { kind: 'block', type: 'drool_exists' },
                { kind: 'block', type: 'drool_forall' },
                { kind: 'block', type: 'drool_and_group' },
                { kind: 'block', type: 'drool_or_group' },
                { kind: 'block', type: 'drool_from' },
                { kind: 'block', type: 'drool_eval' },
                { kind: 'block', type: 'drool_raw_condition' },
            ],
        },
        {
            kind: 'category',
            name: 'Constraints',
            colour: String(BLOCK_COLORS.constraint),
            contents: [
                { kind: 'block', type: 'drool_field_constraint' },
                { kind: 'block', type: 'drool_binding_constraint' },
                { kind: 'block', type: 'drool_raw_constraint' },
            ],
        },
        {
            kind: 'category',
            name: 'Consequences',
            colour: String(BLOCK_COLORS.consequence),
            contents: [
                { kind: 'block', type: 'drool_modify' },
                { kind: 'block', type: 'drool_modify_method' },
                { kind: 'block', type: 'drool_insert' },
                { kind: 'block', type: 'drool_retract' },
                { kind: 'block', type: 'drool_set_global' },
                { kind: 'block', type: 'drool_raw_consequence' },
            ],
        },
    ],
}
