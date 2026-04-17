import {useState} from 'react'
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import {Add, Delete} from '@mui/icons-material'
import {useDebounced} from '../../hooks/use-debounced'
import type {
    AndCondition,
    Condition,
    Constraint,
    FactPattern,
    FactType,
    OrCondition,
    UnboundPattern
} from 'drools-builder'
import {ConstraintEditor} from './ConstraintEditor'
import {RawCodeInput} from './RawCodeInput'
import {normalizeBinding} from './utils'

const CONDITION_KINDS = [
    {value: 'FactPattern', label: 'Pattern'},
    {value: 'Exists', label: 'Exists'},
    {value: 'Not', label: 'Not'},
    {value: 'And', label: 'And group'},
    {value: 'Or', label: 'Or group'},
    {value: 'From', label: 'From'},
    {value: 'Forall', label: 'Forall'},
    {value: 'Eval', label: 'Eval'},
    {value: 'RawCondition', label: 'Raw'},
]

interface ConditionEditorProps {
    condition: Condition
    onChange: (condition: Condition) => void
    onDelete: () => void
    depth?: number
}

export function ConditionEditor({condition: initialCondition, onChange, onDelete, depth = 0}: ConditionEditorProps) {
    // Local state prevents parent re-renders on every keystroke.
    // onChange is debounced so RuleBuilder only updates after the user pauses.
    const [condition, setCondition] = useState<Condition>(initialCondition)
    const debouncedOnChange = useDebounced(onChange, 300)

    const handleChange = (next: Condition) => {
        setCondition(next)
        debouncedOnChange(next)
    }

    const emptyPattern: FactPattern = {kind: 'FactPattern', factType: 'PointConcept', constraints: []}
    const emptyUnbound: UnboundPattern = {kind: 'UnboundPattern', factType: 'PointConcept', constraints: []}

    const changeKind = (kind: string) => {
        if (kind === 'FactPattern') handleChange(emptyPattern)
        else if (kind === 'Exists') handleChange({kind: 'Exists', condition: emptyUnbound})
        else if (kind === 'Not') handleChange({kind: 'Not', condition: emptyUnbound})
        else if (kind === 'And') handleChange({kind: 'And', conditions: [emptyPattern]})
        else if (kind === 'Or') handleChange({kind: 'Or', conditions: [emptyPattern]})
        else if (kind === 'From') handleChange({kind: 'From', pattern: emptyPattern, expression: ''})
        else if (kind === 'Forall') handleChange({kind: 'Forall', condition: emptyPattern})
        else if (kind === 'Eval') handleChange({kind: 'Eval', expression: ''})
        else handleChange({kind: 'RawCondition', drl: ''})
    }

    const displayKind = condition.kind

    return (
        <Card variant="outlined"
              sx={{borderLeft: depth > 0 ? '3px solid' : undefined, borderLeftColor: 'primary.main'}}>
            <CardContent>
                <Stack sx={{gap: 2}}>
                    <Stack sx={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Select
                            value={displayKind}
                            onChange={e => changeKind(e.target.value)}
                            size="small"
                            sx={{minWidth: 130}}
                        >
                            {CONDITION_KINDS.map(k => (
                                <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>
                            ))}
                        </Select>
                        <Tooltip title="Remove condition">
                            <IconButton size="small" color="error" onClick={onDelete}>
                                <Delete fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {condition.kind === 'FactPattern' && (
                        <PatternEditor pattern={condition} onChange={handleChange}/>
                    )}

                    {/* Not and Exists cannot bind — use UnboundPatternEditor */}
                    {(condition.kind === 'Not' || condition.kind === 'Exists') && (
                        <UnboundPatternEditor
                            pattern={condition.condition.kind === 'UnboundPattern' ? condition.condition : emptyUnbound}
                            onChange={p => handleChange({...condition, condition: p})}
                        />
                    )}

                    {/* Forall can bind */}
                    {condition.kind === 'Forall' && (
                        <PatternEditor
                            pattern={condition.condition.kind === 'FactPattern' ? condition.condition : emptyPattern}
                            onChange={p => handleChange({...condition, condition: p})}
                        />
                    )}

                    {(condition.kind === 'And' || condition.kind === 'Or') && (
                        <GroupEditor group={condition} onChange={handleChange} depth={depth}/>
                    )}

                    {condition.kind === 'From' && (
                        <Stack sx={{gap: 1}}>
                            <PatternEditor
                                pattern={condition.pattern}
                                onChange={p => handleChange({...condition, pattern: p})}
                            />
                            <RawCodeInput
                                label="From expression"
                                value={condition.expression}
                                onChange={v => handleChange({...condition, expression: v})}
                                rows={1}
                                placeholder="accumulate(...) or $collection or someMethod()"
                            />
                        </Stack>
                    )}

                    {condition.kind === 'Eval' && (
                        <RawCodeInput
                            label="Eval expression"
                            value={condition.expression}
                            onChange={v => handleChange({...condition, expression: v})}
                            rows={1}
                            placeholder="someCondition && otherCondition"
                        />
                    )}

                    {condition.kind === 'RawCondition' && (
                        <RawCodeInput
                            label="Raw condition"
                            value={condition.drl}
                            onChange={v => handleChange({kind: 'RawCondition', drl: v})}
                            rows={2}
                        />
                    )}
                </Stack>
            </CardContent>
        </Card>
    )
}

// ─── And / Or group editor ────────────────────────────────────────────────────

interface GroupEditorProps {
    group: AndCondition | OrCondition
    onChange: (group: AndCondition | OrCondition) => void
    depth: number
}

function GroupEditor({group, onChange, depth}: GroupEditorProps) {
    const connector = group.kind === 'And' ? 'AND' : 'OR'
    const connectorColor = group.kind === 'And' ? 'primary' : 'secondary'

    const addCondition = () => {
        const newCondition: Condition = {kind: 'FactPattern', factType: 'PointConcept', constraints: []}
        onChange({...group, conditions: [...group.conditions, newCondition]})
    }

    const updateCondition = (index: number, condition: Condition) => {
        const conditions = [...group.conditions]
        conditions[index] = condition
        onChange({...group, conditions})
    }

    const removeCondition = (index: number) => {
        onChange({...group, conditions: group.conditions.filter((_, i) => i !== index)})
    }

    return (
        <Stack sx={{gap: 1}}>
            {group.conditions.map((condition, i) => (
                <Stack key={i} sx={{gap: 1}}>
                    {i > 0 && (
                        <Chip
                            label={connector}
                            size="small"
                            color={connectorColor}
                            sx={{alignSelf: 'flex-start', fontWeight: 700, fontSize: '0.7rem'}}
                        />
                    )}
                    {depth < 2 ? (
                        <ConditionEditor
                            condition={condition}
                            onChange={c => updateCondition(i, c)}
                            onDelete={() => removeCondition(i)}
                            depth={depth + 1}
                        />
                    ) : (
                        <RawCodeInput
                            label="Nested condition (raw)"
                            value={'drl' in condition ? (condition as { drl: string }).drl : ''}
                            onChange={v => updateCondition(i, {kind: 'RawCondition', drl: v})}
                            rows={1}
                        />
                    )}
                </Stack>
            ))}
            <Button size="small" startIcon={<Add/>} onClick={addCondition} sx={{alignSelf: 'flex-start'}}>
                Add condition to {connector} group
            </Button>
        </Stack>
    )
}

// ─── Unbound pattern sub-editor (used inside Not / Exists — no binding field) ──

interface UnboundPatternEditorProps {
    pattern: UnboundPattern
    onChange: (pattern: UnboundPattern) => void
}

function UnboundPatternEditor({pattern, onChange}: UnboundPatternEditorProps) {
    const addConstraint = () => {
        onChange({
            ...pattern,
            constraints: [...pattern.constraints, {kind: 'FieldConstraint', field: '', operator: '==', value: ''}]
        })
    }
    const updateConstraint = (index: number, constraint: Constraint) => {
        const constraints = [...pattern.constraints]
        constraints[index] = constraint
        onChange({...pattern, constraints})
    }
    const removeConstraint = (index: number) => {
        onChange({...pattern, constraints: pattern.constraints.filter((_, i) => i !== index)})
    }

    return (
        <Stack sx={{gap: 2}}>
            <Autocomplete
                freeSolo
                options={KNOWN_FACT_TYPES}
                value={pattern.factType}
                onChange={(_, value) => onChange({...pattern, factType: (value ?? '') as FactType})}
                onInputChange={(_, value) => onChange({...pattern, factType: value as FactType})}
                size="small"
                sx={{minWidth: 220}}
                renderInput={(params) => <TextField {...params} label="Fact type" placeholder="PointConcept"/>}
            />
            <Box>
                <Stack sx={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                    <Typography variant="caption" sx={{color: 'text.secondary'}}>Constraints</Typography>
                    <Button size="small" startIcon={<Add/>} onClick={addConstraint}>Add</Button>
                </Stack>
                <Stack sx={{gap: 1}}>
                    {pattern.constraints.length === 0 && (
                        <Typography variant="caption" sx={{color: 'text.secondary'}}>
                            No constraints — matches any {pattern.factType}.
                        </Typography>
                    )}
                    {pattern.constraints.map((constraint, i) => (
                        <ConstraintEditor key={i} constraint={constraint} onChange={c => updateConstraint(i, c)}
                                          onDelete={() => removeConstraint(i)}/>
                    ))}
                </Stack>
            </Box>
        </Stack>
    )
}

// ─── Pattern sub-editor ───────────────────────────────────────────────────────

interface PatternEditorProps {
    pattern: FactPattern
    onChange: (pattern: FactPattern) => void
}

function PatternEditor({pattern, onChange}: PatternEditorProps) {
    const addConstraint = () => {
        const newConstraint: Constraint = {
            kind: 'FieldConstraint', field: '', operator: '==', value: '',
        }
        onChange({...pattern, constraints: [...pattern.constraints, newConstraint]})
    }

    const updateConstraint = (index: number, constraint: Constraint) => {
        const constraints = [...pattern.constraints]
        constraints[index] = constraint
        onChange({...pattern, constraints})
    }

    const removeConstraint = (index: number) => {
        onChange({...pattern, constraints: pattern.constraints.filter((_, i) => i !== index)})
    }

    return (
        <Stack sx={{gap: 2}}>
            <Stack sx={{flexDirection: 'row', gap: 2, flexWrap: 'wrap'}}>
                <Autocomplete
                    freeSolo
                    options={KNOWN_FACT_TYPES}
                    value={pattern.factType}
                    onChange={(_, value) => onChange({...pattern, factType: (value ?? '') as FactType})}
                    onInputChange={(_, value) => onChange({...pattern, factType: value as FactType})}
                    size="small"
                    sx={{minWidth: 220}}
                    renderInput={(params) => (
                        <TextField {...params} label="Fact type" placeholder="PointConcept"/>
                    )}
                />
                <TextField
                    label="Binding (optional)"
                    value={pattern.binding ?? ''}
                    onChange={e => onChange({...pattern, binding: normalizeBinding(e.target.value) || undefined})}
                    size="small"
                    sx={{width: 160}}
                    placeholder="$pc"
                />
            </Stack>

            <Box>
                <Stack sx={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                    <Typography variant="caption" color="text.secondary">Constraints</Typography>
                    <Button size="small" startIcon={<Add/>} onClick={addConstraint}>Add</Button>
                </Stack>
                <Stack sx={{gap: 1}}>
                    {pattern.constraints.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                            No constraints — matches any {pattern.factType}.
                        </Typography>
                    )}
                    {pattern.constraints.map((constraint, i) => (
                        <ConstraintEditor
                            key={i}
                            constraint={constraint}
                            onChange={c => updateConstraint(i, c)}
                            onDelete={() => removeConstraint(i)}
                        />
                    ))}
                </Stack>
            </Box>
        </Stack>
    )
}
