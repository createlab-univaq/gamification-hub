import type {Condition, Consequence, Constraint, DroolsFile} from 'drools-builder'

type ClassDeclaration = NonNullable<DroolsFile['declarations']>[number]
type FunctionDefinition = NonNullable<DroolsFile['functions']>[number]

// ─── Public entry point ───────────────────────────────────────────────────────

function buildImportsChain(file: DroolsFile): object {
    const blocks: object[] = []
    if (file.package)
        blocks.push({ type: 'drool_package', fields: { PACKAGE: file.package } })
    file.imports.forEach(imp => {
        const b = importToBlock(imp)
        if (b) blocks.push(b)
    })
    if (!blocks.length) return {}
    let chain = blocks[blocks.length - 1]
    for (let i = blocks.length - 2; i >= 0; i--)
        chain = { ...blocks[i], next: { block: chain } }
    return { IMPORTS: { block: chain } }
}

export function droolsFileToBlocklyState(file: DroolsFile): object {
    return {
        blocks: {
            languageVersion: 0,
            blocks: [
                ...((file.package || file.imports.length) ? [{
                    type: 'drool_imports',
                    inputs: buildImportsChain(file),
                }] : []),
                ...((file.globals ?? []).length ? [{ type: 'drool_globals', inputs: chainInputKey('GLOBALS', file.globals!, globalToBlock) }] : []),
                ...(file.declarations ?? []).map(declarationToBlock).filter((b): b is object => b !== null),
                ...(file.functions ?? []).map(functionToBlock).filter((b): b is object => b !== null),
                ...file.rules.map(rule => ({
                    type: 'drool_rule',
                    fields: {
                        RULE_NAME: rule.name,
                        SALIENCE: rule.salience ?? 0,
                        AGENDA_GROUP: rule.agendaGroup ?? '',
                        RULEFLOW_GROUP: rule.ruleFlowGroup ?? '',
                        NO_LOOP: rule.noLoop ? 'TRUE' : 'FALSE',
                        ACTIVE_ON_LOCK: rule.lockOnActive ? 'TRUE' : 'FALSE',
                    },
                    inputs: {
                        ...chainInputKey('WHEN', rule.conditions, conditionToBlock),
                        ...chainInputKey('THEN', rule.consequences, consequenceToBlock),
                    },
                })),
            ],
        },
    }
}

// ─── Declaration mapping ──────────────────────────────────────────────────────

function declarationToBlock(decl: ClassDeclaration): object | null {
    return {
        type: 'drool_declare',
        fields: { CLASS_NAME: decl.className },
        inputs: chainInputKey('ATTRIBUTES', decl.attributes, attr => ({
            type: 'drool_attribute',
            fields: { NAME: attr.name, TYPE: attr.type },
        })),
    }
}

// ─── Function mapping ─────────────────────────────────────────────────────────

function functionToBlock(fn: FunctionDefinition): object | null {
    return {
        type: 'drool_function',
        fields: {
            RETURN_TYPE: fn.returnType,
            NAME: fn.name,
            PARAMS: fn.params,
        },
        inputs: chainInputKey('BODY', fn.body, consequenceToBlock),
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
                inputs: chainInputKey('CONDITIONS', condition.conditions, conditionToBlock),
            }

        case 'Or':
            return {
                type: 'drool_or_group',
                inputs: chainInputKey('CONDITIONS', condition.conditions, conditionToBlock),
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

        case 'ReturnConsequence':
            return {
                type: 'drool_return',
                fields: { EXPRESSION: consequence.expression },
            }

        case 'WhileConsequence':
            return {
                type: 'drool_while',
                fields: { CONDITION: consequence.condition },
                inputs: chainInputKey('BODY', consequence.body, consequenceToBlock),
            }

        case 'ForEachConsequence':
            return {
                type: 'drool_for_each',
                fields: { TYPE: consequence.typeName, VAR_NAME: consequence.varName, COLLECTION: consequence.collection },
                inputs: chainInputKey('BODY', consequence.body, consequenceToBlock),
            }

        case 'ForConsequence':
            return {
                type: 'drool_for',
                fields: { INIT: consequence.init, CONDITION: consequence.condition, UPDATE: consequence.update },
                inputs: chainInputKey('BODY', consequence.body, consequenceToBlock),
            }

        case 'VarDeclConsequence':
            return {
                type: 'drool_var_decl',
                fields: { TYPE: consequence.typeName, NAME: consequence.name, VALUE: consequence.value },
            }

        case 'MethodCallConsequence':
            return {
                type: 'drool_method_call',
                fields: { OBJECT: consequence.object, METHOD: consequence.method, ARGS: consequence.args },
            }

        case 'SwitchConsequence':
            return {
                type: 'drool_switch',
                fields: { EXPRESSION: consequence.expression },
                inputs: chainInputKey('CASES', [
                    ...consequence.cases.map(c => ({
                        type: 'drool_case' as const,
                        fields: { VALUE: c.value },
                        inputs: chainInputKey('BODY', c.body, consequenceToBlock),
                    })),
                    ...(consequence.default?.length ? [{
                        type: 'drool_default' as const,
                        inputs: chainInputKey('BODY', consequence.default, consequenceToBlock),
                    }] : []),
                ], b => b),
            }

        case 'IfConsequence':
            return consequence.else?.length
                ? {
                    type: 'drool_if_else',
                    fields: { CONDITION: consequence.condition },
                    inputs: {
                        ...chainInputKey('THEN', consequence.then, consequenceToBlock),
                        ...chainInputKey('ELSE', consequence.else, consequenceToBlock),
                    },
                }
                : {
                    type: 'drool_if',
                    fields: { CONDITION: consequence.condition },
                    inputs: chainInputKey('THEN', consequence.then, consequenceToBlock),
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
