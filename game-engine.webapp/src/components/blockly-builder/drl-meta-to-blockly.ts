import type {Condition, Consequence, Constraint, DroolsFile} from 'drools-builder'

// ─── Public entry point ───────────────────────────────────────────────────────

export function droolsFileToBlocklyState(file: DroolsFile): object {
    return {
        blocks: {
            languageVersion: 0,
            blocks: file.rules.map(rule => ({
                type: 'drool_rule',
                fields: {
                    RULE_NAME: rule.name,
                    SALIENCE: rule.salience ?? 0,
                    AGENDA_GROUP: rule.agendaGroup ?? '',
                    NO_LOOP: rule.noLoop ? 'TRUE' : 'FALSE',
                },
                inputs: {
                    ...chainInputKey('IMPORTS', file.imports, importToBlock),
                    ...chainInputKey('GLOBALS', file.globals ?? [], globalToBlock),
                    ...chainInputKey('WHEN', rule.conditions, conditionToBlock),
                    ...chainInputKey('THEN', rule.consequences, consequenceToBlock),
                },
            })),
        },
    }
}

// ─── Import mapping ───────────────────────────────────────────────────────────

function importToBlock(cls: string): object | null {
    const trimmed = cls.trim()
    return trimmed ? { type: 'drool_import', fields: { CLASS: trimmed } } : null
}

// ─── Global mapping ───────────────────────────────────────────────────────────

function globalToBlock(g: { type: string; name: string }): object | null {
    return g.type && g.name
        ? { type: 'drool_global', fields: { TYPE: g.type, NAME: g.name } }
        : null
}

// ─── Condition mapping ────────────────────────────────────────────────────────

function conditionToBlock(condition: Condition): object | null {
    switch (condition.kind) {
        case 'FactPattern':
            return {
                type: 'drool_fact_pattern',
                fields: {
                    BINDING: condition.binding ?? '',
                    FACT_TYPE: condition.factType,
                },
                inputs: constraintsInput(condition.constraints),
            }

        case 'UnboundPattern':
            return {
                type: 'drool_unbound_pattern',
                fields: { FACT_TYPE: condition.factType },
                inputs: constraintsInput(condition.constraints),
            }

        case 'Not':
            return {
                type: 'drool_not',
                inputs: singleConditionInput('CONDITION', condition.condition),
            }

        case 'Exists':
            return {
                type: 'drool_exists',
                inputs: singleConditionInput('CONDITION', condition.condition),
            }

        case 'Forall':
            return {
                type: 'drool_forall',
                inputs: singleConditionInput('CONDITION', condition.condition),
            }

        case 'And':
            return {
                type: 'drool_and_group',
                inputs: chainInput(condition.conditions, conditionToBlock),
            }

        case 'Or':
            return {
                type: 'drool_or_group',
                inputs: chainInput(condition.conditions, conditionToBlock),
            }

        case 'From':
            return {
                type: 'drool_from',
                fields: { EXPRESSION: condition.expression },
                inputs: singleConditionInput('PATTERN', condition.pattern),
            }

        case 'Eval':
            return {
                type: 'drool_eval',
                fields: { EXPRESSION: condition.expression },
            }

        case 'RawCondition':
            return {
                type: 'drool_raw_condition',
                fields: { DRL: condition.drl },
            }

        default:
            return null
    }
}

// ─── Consequence mapping ──────────────────────────────────────────────────────

function consequenceToBlock(consequence: Consequence): object | null {
    switch (consequence.kind) {
        case 'ModifyConsequence':
            return {
                type: 'drool_modify',
                fields: { BINDING: consequence.binding },
                inputs: chainInputKey(
                    'METHODS',
                    consequence.modifications,
                    mod => ({
                        type: 'drool_modify_method',
                        fields: {
                            METHOD: mod.method,
                            ARGS: mod.args.join(', '),
                        },
                    }),
                ),
            }

        case 'InsertConsequence':
            return {
                type: 'drool_insert',
                fields: { EXPRESSION: consequence.objectExpression },
            }

        case 'RetractConsequence':
            return {
                type: 'drool_retract',
                fields: { BINDING: consequence.binding },
            }

        case 'SetGlobalConsequence':
            return {
                type: 'drool_set_global',
                fields: { EXPRESSION: consequence.expression },
            }

        case 'RawConsequence':
            return {
                type: 'drool_raw_consequence',
                fields: { CODE: consequence.code },
            }

        default:
            return null
    }
}

// ─── Constraint mapping ───────────────────────────────────────────────────────

function constraintToBlock(constraint: Constraint): object | null {
    switch (constraint.kind) {
        case 'FieldConstraint':
            return {
                type: 'drool_field_constraint',
                fields: {
                    FIELD: constraint.field,
                    OPERATOR: constraint.operator,
                    VALUE: constraint.value,
                },
            }

        case 'BindingConstraint':
            return {
                type: 'drool_binding_constraint',
                fields: {
                    BINDING: constraint.binding,
                    FIELD: constraint.field,
                },
            }

        case 'RawConstraint':
            return {
                type: 'drool_raw_constraint',
                fields: { EXPRESSION: constraint.expression },
            }

        default:
            return null
    }
}

// ─── Chain builders ───────────────────────────────────────────────────────────
// Blockly serialization chains blocks via nested `next` properties:
// { block: { type, fields, inputs, next: { block: { ... } } } }

function buildChainForward<T>(items: T[], toBlock: (item: T) => object | null): object | null {
    const blocks = items.map(toBlock).filter((b): b is object => b !== null)
    if (!blocks.length) return null

    let result = blocks[blocks.length - 1]
    for (let i = blocks.length - 2; i >= 0; i--) {
        result = { ...blocks[i], next: { block: result } }
    }
    return result
}

// Produces { [key]: { block: ... } } for any named input
function chainInputKey<T>(key: string, items: T[], toBlock: (item: T) => object | null): object {
    const chain = buildChainForward(items, toBlock)
    return chain ? { [key]: { block: chain } } : {}
}

function singleConditionInput(key: string, condition: Condition): object {
    const block = conditionToBlock(condition)
    return block ? { [key]: { block } } : {}
}

function constraintsInput(constraints: Constraint[]): object {
    return chainInputKey('CONSTRAINTS', constraints, constraintToBlock)
}
