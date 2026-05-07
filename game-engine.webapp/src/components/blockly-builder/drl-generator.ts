import * as Blockly from 'blockly'
import type { Block, Workspace } from 'blockly'

export const drlGenerator = new Blockly.CodeGenerator('DRL')

const I = '    '  // 4-space indent
const II = I + I  // 8-space indent

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectChain(parent: Block, inputName: string): Block[] {
    const blocks: Block[] = []
    let cur: Block | null = parent.getInputTargetBlock(inputName)
    while (cur) {
        blocks.push(cur)
        cur = cur.nextConnection?.targetBlock() ?? null
    }
    return blocks
}

function generateBlock(block: Block): string {
    const fn = drlGenerator.forBlock[block.type]
    return fn ? (fn(block, drlGenerator) as string) : ''
}

function firstBlock(parent: Block, inputName: string): Block | null {
    return parent.getInputTargetBlock(inputName)
}

// ─── Rule ─────────────────────────────────────────────────────────────────────

drlGenerator.forBlock['drool_package'] = function (block: Block): string {
    const pkg = (block.getFieldValue('PACKAGE') ?? '').trim()
    return pkg ? `package ${pkg}` : ''
}

drlGenerator.forBlock['drool_imports'] = function (block: Block): string {
    return collectChain(block, 'IMPORTS').map(generateBlock).filter(Boolean).join('\n')
}

drlGenerator.forBlock['drool_import'] = function (block: Block): string {
    const cls = (block.getFieldValue('CLASS') ?? '').trim()
    return cls ? `import ${cls};` : ''
}

drlGenerator.forBlock['drool_globals'] = function (block: Block): string {
    return collectChain(block, 'GLOBALS').map(generateBlock).filter(Boolean).join('\n')
}

drlGenerator.forBlock['drool_global'] = function (block: Block): string {
    const type = (block.getFieldValue('TYPE') ?? '').trim()
    const name = (block.getFieldValue('NAME') ?? '').trim()
    return type && name ? `global ${type} ${name};` : ''
}

drlGenerator.forBlock['drool_rule'] = function (block: Block): string {
    const name = block.getFieldValue('RULE_NAME') || 'my_rule'
    const salience = Number(block.getFieldValue('SALIENCE') ?? 0)
    const agendaGroup = (block.getFieldValue('AGENDA_GROUP') ?? '').trim()
    const noLoop = block.getFieldValue('NO_LOOP') === 'TRUE'
    const lockOnActive = block.getFieldValue('ACTIVE_ON_LOCK') === 'TRUE'

    const attrs: string[] = []
    if (salience !== 0) attrs.push(`${I}salience ${salience}`)
    if (agendaGroup) attrs.push(`${I}agenda-group ${agendaGroup}`)
    attrs.push(`${I}no-loop ${noLoop}`)
    attrs.push(`${I}lock-on-active ${lockOnActive}`)

    const conditions = collectChain(block, 'WHEN').map(generateBlock).filter(Boolean)
    const consequences = collectChain(block, 'THEN').map(generateBlock).filter(Boolean)

    return [
        `rule "${name}"`,
        ...attrs,
        `${I}when`,
        ...(conditions.length ? conditions : [`${II}// no conditions`]),
        `${I}then`,
        ...(consequences.length ? consequences : [`${II}// no consequences`]),
        'end',
    ].join('\n')
}

// ─── Conditions ───────────────────────────────────────────────────────────────

drlGenerator.forBlock['drool_fact_pattern'] = function (block: Block): string {
    const binding = (block.getFieldValue('BINDING') ?? '').trim()
    const factType = block.getFieldValue('FACT_TYPE') || 'PointConcept'
    const constraints = buildConstraints(block)
    const prefix = binding ? `$${binding} : ` : ''
    return `${II}${prefix}${factType}(${constraints})`
}

drlGenerator.forBlock['drool_unbound_pattern'] = function (block: Block): string {
    const factType = block.getFieldValue('FACT_TYPE') || 'PointConcept'
    const constraints = buildConstraints(block)
    return `${II}${factType}(${constraints})`
}

drlGenerator.forBlock['drool_not'] = function (block: Block): string {
    const inner = firstBlock(block, 'CONDITION')
    const innerCode = inner ? generateBlock(inner).trimStart() : ''
    return `${II}not(${innerCode})`
}

drlGenerator.forBlock['drool_exists'] = function (block: Block): string {
    const inner = firstBlock(block, 'CONDITION')
    const innerCode = inner ? generateBlock(inner).trimStart() : ''
    return `${II}exists(${innerCode})`
}

drlGenerator.forBlock['drool_forall'] = function (block: Block): string {
    const inner = firstBlock(block, 'CONDITION')
    const innerCode = inner ? generateBlock(inner).trim() : ''
    return `${II}forall(\n${II}    ${innerCode}\n${II})`
}

drlGenerator.forBlock['drool_and_group'] = function (block: Block): string {
    const conditions = collectChain(block, 'CONDITIONS').map(generateBlock).filter(Boolean)
    return [`${II}(`, ...conditions.map(c => `${II}    ${c.trimStart()}`), `${II})`].join('\n')
}

drlGenerator.forBlock['drool_or_group'] = function (block: Block): string {
    const conditions = collectChain(block, 'CONDITIONS').map(generateBlock).filter(Boolean)
    return conditions.map(c => c.trimStart()).join(`\n${II}or `)
        ? `${II}(${conditions.map(c => `\n${II}    ${c.trimStart()}`).join(`\n${II}    or`)}\n${II})`
        : ''
}

drlGenerator.forBlock['drool_from'] = function (block: Block): string {
    const expr = (block.getFieldValue('EXPRESSION') ?? '').trim()
    const patternBlock = firstBlock(block, 'PATTERN')
    if (!patternBlock) return `${II}// from: missing pattern`
    const patternCode = generateBlock(patternBlock).trimStart()
    return `${II}${patternCode} from ${expr}`
}

drlGenerator.forBlock['drool_eval'] = function (block: Block): string {
    const expr = (block.getFieldValue('EXPRESSION') ?? '').trim()
    return `${II}eval(${expr})`
}

drlGenerator.forBlock['drool_raw_condition'] = function (block: Block): string {
    return `${II}${(block.getFieldValue('DRL') ?? '').trim()}`
}

// ─── Constraints ──────────────────────────────────────────────────────────────

// Constraints are collected inline by fact patterns — these stubs handle orphans.
drlGenerator.forBlock['drool_field_constraint'] = function (block: Block): string {
    return `${II}${constraintText(block)}`
}

drlGenerator.forBlock['drool_binding_constraint'] = function (block: Block): string {
    return `${II}${constraintText(block)}`
}

drlGenerator.forBlock['drool_raw_constraint'] = function (block: Block): string {
    return `${II}${constraintText(block)}`
}

// ─── Consequences ─────────────────────────────────────────────────────────────

drlGenerator.forBlock['drool_modify'] = function (block: Block): string {
    const binding = (block.getFieldValue('BINDING') ?? '').trim()
    const methods = collectChain(block, 'METHODS')
        .map(b => {
            const method = (b.getFieldValue('METHOD') ?? '').trim()
            const args = (b.getFieldValue('ARGS') ?? '').trim()
            return method ? `${method}(${args})` : ''
        })
        .filter(Boolean)
    return `${II}modify(${binding}) { ${methods.join(', ')} }`
}

drlGenerator.forBlock['drool_modify_method'] = function (block: Block): string {
    // Consumed by drool_modify — stub for orphaned blocks
    const method = (block.getFieldValue('METHOD') ?? '').trim()
    const args = (block.getFieldValue('ARGS') ?? '').trim()
    return `${II}${method}(${args})`
}

drlGenerator.forBlock['drool_insert'] = function (block: Block): string {
    return `${II}insert(${(block.getFieldValue('EXPRESSION') ?? '').trim()});`
}

drlGenerator.forBlock['drool_retract'] = function (block: Block): string {
    return `${II}retract(${(block.getFieldValue('BINDING') ?? '').trim()});`
}

drlGenerator.forBlock['drool_set_global'] = function (block: Block): string {
    return `${II}${(block.getFieldValue('EXPRESSION') ?? '').trim()};`
}

drlGenerator.forBlock['drool_raw_consequence'] = function (block: Block): string {
    const code = (block.getFieldValue('CODE') ?? '').trim()
    return `${II}${code.endsWith(';') ? code : code + ';'}`
}

drlGenerator.forBlock['drool_declare'] = function (block: Block): string {
    const className = (block.getFieldValue('CLASS_NAME') ?? '').trim()
    const attrs = collectChain(block, 'ATTRIBUTES')
        .map(b => {
            const name = (b.getFieldValue('NAME') ?? '').trim()
            const type = (b.getFieldValue('TYPE') ?? '').trim()
            return name && type ? `${I}${name} : ${type}` : ''
        })
        .filter(Boolean)
    return attrs.length
        ? `declare ${className}\n${attrs.join('\n')}\nend`
        : `declare ${className}\nend`
}

drlGenerator.forBlock['drool_attribute'] = function (block: Block): string {
    // Consumed by drool_declare — stub for orphaned blocks
    const name = (block.getFieldValue('NAME') ?? '').trim()
    const type = (block.getFieldValue('TYPE') ?? '').trim()
    return `${I}${name} : ${type}`
}

drlGenerator.forBlock['drool_return'] = function (block: Block): string {
    const expression = (block.getFieldValue('EXPRESSION') ?? '').trim()
    return `${II}${expression ? `return ${expression};` : 'return;'}`
}

drlGenerator.forBlock['drool_function'] = function (block: Block): string {
    const returnType = (block.getFieldValue('RETURN_TYPE') ?? '').trim()
    const name = (block.getFieldValue('NAME') ?? '').trim()
    const params = (block.getFieldValue('PARAMS') ?? '').trim()
    const body = collectChain(block, 'BODY').map(generateBlock).filter(Boolean).join('\n')
    return `function ${returnType} ${name}(${params}) {\n${body}\n}`
}

const addIndent = (code: string, levels = 1): string =>
    code.split('\n').map(line => line ? I.repeat(levels) + line : line).join('\n')

const indentBlock = (code: string): string =>
    code.split('\n').map(line => line ? `${I}${line}` : line).join('\n')

drlGenerator.forBlock['drool_while'] = function (block: Block): string {
    const condition = (block.getFieldValue('CONDITION') ?? '').trim()
    const body = indentBlock(collectChain(block, 'BODY').map(generateBlock).filter(Boolean).join('\n'))
    return `${II}while (${condition}) {\n${body}\n${II}}`
}

drlGenerator.forBlock['drool_for_each'] = function (block: Block): string {
    const type       = (block.getFieldValue('TYPE')       ?? '').trim()
    const varName    = (block.getFieldValue('VAR_NAME')   ?? '').trim()
    const collection = (block.getFieldValue('COLLECTION') ?? '').trim()
    const body = indentBlock(collectChain(block, 'BODY').map(generateBlock).filter(Boolean).join('\n'))
    return `${II}for (${type} ${varName} : ${collection}) {\n${body}\n${II}}`
}

drlGenerator.forBlock['drool_for'] = function (block: Block): string {
    const init      = (block.getFieldValue('INIT')      ?? '').trim()
    const condition = (block.getFieldValue('CONDITION') ?? '').trim()
    const update    = (block.getFieldValue('UPDATE')    ?? '').trim()
    const body = indentBlock(collectChain(block, 'BODY').map(generateBlock).filter(Boolean).join('\n'))
    return `${II}for (${init}; ${condition}; ${update}) {\n${body}\n${II}}`
}

drlGenerator.forBlock['drool_var_decl'] = function (block: Block): string {
    const type  = (block.getFieldValue('TYPE')  ?? '').trim()
    const name  = (block.getFieldValue('NAME')  ?? '').trim()
    const value = (block.getFieldValue('VALUE') ?? '').trim()
    return `${II}${type} ${name} = ${value};`
}

drlGenerator.forBlock['drool_method_call'] = function (block: Block): string {
    const obj    = (block.getFieldValue('OBJECT') ?? '').trim()
    const method = (block.getFieldValue('METHOD') ?? '').trim()
    const args   = (block.getFieldValue('ARGS')   ?? '').trim()
    return `${II}${obj}.${method}(${args});`
}

drlGenerator.forBlock['drool_switch'] = function (block: Block): string {
    const expression = (block.getFieldValue('EXPRESSION') ?? '').trim()
    const cases = collectChain(block, 'CASES')
    const caseLines = cases.map(b => {
        if (b.type === 'drool_case') {
            const value = (b.getFieldValue('VALUE') ?? '').trim()
            const body = addIndent(collectChain(b, 'BODY').map(generateBlock).filter(Boolean).join('\n'), 2)
            return `${II}${I}case ${value}:\n${body}`
        }
        if (b.type === 'drool_default') {
            const body = addIndent(collectChain(b, 'BODY').map(generateBlock).filter(Boolean).join('\n'), 2)
            return `${II}${I}default:\n${body}`
        }
        return ''
    }).filter(Boolean)
    return `${II}switch (${expression}) {\n${caseLines.join('\n')}\n${II}}`
}

drlGenerator.forBlock['drool_case'] = function (block: Block): string {
    // Consumed by drool_switch — stub for orphaned blocks
    const value = (block.getFieldValue('VALUE') ?? '').trim()
    return `${II}${I}case ${value}: // (place inside a switch block)`
}

drlGenerator.forBlock['drool_default'] = function (block: Block): string {
    // Consumed by drool_switch — stub for orphaned blocks
    return `${II}${I}default: // (place inside a switch block)`
}

drlGenerator.forBlock['drool_if'] = function (block: Block): string {
    const condition = (block.getFieldValue('CONDITION') ?? '').trim()
    const thenCode = indentBlock(collectChain(block, 'THEN').map(generateBlock).filter(Boolean).join('\n'))
    return `${II}if (${condition}) {\n${thenCode}\n${II}}`
}

drlGenerator.forBlock['drool_if_else'] = function (block: Block): string {
    const condition = (block.getFieldValue('CONDITION') ?? '').trim()
    const thenCode = indentBlock(collectChain(block, 'THEN').map(generateBlock).filter(Boolean).join('\n'))
    const elseFirst = firstBlock(block, 'ELSE')
    // If the else branch starts with an if block, render as 'else if' rather than 'else { if }'
    if (elseFirst && (elseFirst.type === 'drool_if' || elseFirst.type === 'drool_if_else')) {
        const elseIfCode = generateBlock(elseFirst).trimStart()
        return `${II}if (${condition}) {\n${thenCode}\n${II}} else ${elseIfCode}`
    }
    const elseCode = indentBlock(collectChain(block, 'ELSE').map(generateBlock).filter(Boolean).join('\n'))
    return `${II}if (${condition}) {\n${thenCode}\n${II}} else {\n${elseCode}\n${II}}`
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function buildConstraints(block: Block): string {
    return collectChain(block, 'CONSTRAINTS')
        .map(constraintText)
        .filter(Boolean)
        .join(', ')
}

function constraintText(block: Block): string {
    switch (block.type) {
        case 'drool_field_constraint': {
            const field = (block.getFieldValue('FIELD') ?? '').trim()
            const op = block.getFieldValue('OPERATOR') ?? '=='
            const value = (block.getFieldValue('VALUE') ?? '').trim()
            return field ? `${field} ${op} ${value}` : ''
        }
        case 'drool_binding_constraint': {
            const binding = (block.getFieldValue('BINDING') ?? '').trim()
            const field = (block.getFieldValue('FIELD') ?? '').trim()
            return binding && field ? `${binding} : ${field}` : ''
        }
        case 'drool_raw_constraint':
            return (block.getFieldValue('EXPRESSION') ?? '').trim()
        default:
            return ''
    }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export function generateDrlFromWorkspace(workspace: Workspace): string {
    const topBlocks = workspace.getTopBlocks(true)
    const importBlocks   = topBlocks.filter(b => b.type === 'drool_imports' || b.type === 'drool_import')
    const globalBlocks   = topBlocks.filter(b => b.type === 'drool_globals' || b.type === 'drool_global')
    const declareBlocks  = topBlocks.filter(b => b.type === 'drool_declare')
    const functionBlocks = topBlocks.filter(b => b.type === 'drool_function')
    const ruleBlocks     = topBlocks.filter(b => b.type === 'drool_rule')

    const sections: string[] = []
    if (importBlocks.length)   sections.push(importBlocks.map(generateBlock).filter(Boolean).join('\n'))
    if (globalBlocks.length)   sections.push(globalBlocks.map(generateBlock).filter(Boolean).join('\n'))
    if (declareBlocks.length)  sections.push(declareBlocks.map(generateBlock).filter(Boolean).join('\n\n'))
    if (functionBlocks.length) sections.push(functionBlocks.map(generateBlock).filter(Boolean).join('\n\n'))
    if (ruleBlocks.length)     sections.push(ruleBlocks.map(generateBlock).filter(Boolean).join('\n\n'))

    return sections.join('\n\n')
}
