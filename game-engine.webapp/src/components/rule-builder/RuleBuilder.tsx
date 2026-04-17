import {useState} from 'react'
import {useDebounced} from '../../hooks/use-debounced'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    FormControlLabel,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import {Add, Delete, ExpandMore} from '@mui/icons-material'
import type {Condition, Consequence, DroolsFile, Rule} from 'drools-builder'
import {MetaToDRLTransformer} from 'drools-builder'
import {ConditionEditor} from './ConditionEditor'
import {ConsequenceEditor} from './ConsequenceEditor'
import {KNOWN_IMPORTS} from "./utils.ts";

interface RuleBuilderProps {
    initialFile?: Partial<DroolsFile>
    onSave?: (file: DroolsFile, drl: string) => void
    onChange?: (file: DroolsFile) => void
}

const emptyFile = (): DroolsFile => ({
    name: 'rule',
    imports: [],
    rules: [{name: '', conditions: [], consequences: []}],
})

export function RuleBuilder({initialFile, onSave, onChange}: RuleBuilderProps) {
    const [file, setFile] = useState<DroolsFile>({...emptyFile(), ...initialFile})
    const rule: Rule = file.rules[0] ?? {name: '', conditions: [], consequences: []}
    const [drlPreview, setDrlPreview] = useState<string | null>(null)
    const [drlError, setDrlError] = useState<string | null>(null)
    const [nextImport, setNextImport] = useState<string | null>(null)

    const regenerateDrl = useDebounced((nextFile: DroolsFile) => {
        try {
            setDrlError(null)
            setDrlPreview(MetaToDRLTransformer.generate(nextFile))
        } catch (e) {
            setDrlPreview(null)
        }
    }, 400)

    const updateRule = (partial: Partial<Rule>) => {
        const nextRule = {...rule, ...partial}
        const nextFile = {...file, rules: [nextRule]}
        setFile(nextFile)
        onChange?.(nextFile)
        regenerateDrl(nextFile)
    }

    const updateFile = (partial: Partial<DroolsFile>) => {
        const nextFile = {...file, ...partial}
        setFile(nextFile)
        onChange?.(nextFile)
        regenerateDrl(nextFile)
    }

    // ─── Conditions ──────────────────────────────────────────────────────────────

    const addCondition = () => {
        updateRule({conditions: [...rule.conditions, {kind: 'FactPattern', factType: 'PointConcept', constraints: []}]})
    }

    const updateCondition = (index: number, condition: Condition) => {
        const conditions = [...rule.conditions]
        conditions[index] = condition
        updateRule({conditions})
    }

    const removeCondition = (index: number) => {
        updateRule({conditions: rule.conditions.filter((_, i) => i !== index)})
    }

    // ─── Consequences ─────────────────────────────────────────────────────────────

    const addConsequence = () => {
        updateRule({consequences: [...rule.consequences, {kind: 'RawConsequence', code: ''}]})
    }

    const updateConsequence = (index: number, consequence: Consequence) => {
        const consequences = [...rule.consequences]
        consequences[index] = consequence
        updateRule({consequences})
    }

    const removeConsequence = (index: number) => {
        updateRule({consequences: rule.consequences.filter((_, i) => i !== index)})
    }

    // ─── Save ─────────────────────────────────────────────────────────────────────

    const handleSave = () => {
        try {
            const drl = MetaToDRLTransformer.generate(file)
            onSave?.(file, drl)
        } catch (e) {
            setDrlError(String(e))
        }
    }

    const bindings = rule.conditions
        .filter((c): c is Extract<Condition, { kind: 'FactPattern' }> => c.kind === 'FactPattern' && !!c.binding)
        .map(c => c.binding!)

    return (
        <Stack sx={{flexDirection: 'row', gap: 2, alignItems: 'flex-start'}}>

            {/* ─── Left: form (70%) ──────────────────────────────────────────────── */}
            <Stack sx={{flex: '0 0 70%', gap: 0}}>

                {/* Rule Header */}
                <Card variant="outlined">
                    <CardContent>
                        <Stack sx={{gap: 2}}>
                            <TextField
                                label="Rule name"
                                value={rule.name}
                                onChange={e => updateRule({name: e.target.value})}
                                fullWidth
                                size="small"
                                placeholder="award p1 on action1"
                            />
                            <Stack sx={{flexDirection: 'row', gap: 3, alignItems: 'center', flexWrap: 'wrap'}}>
                                <TextField
                                    label="Salience"
                                    type="number"
                                    value={rule.salience ?? ''}
                                    onChange={e => updateRule({salience: e.target.value ? Number(e.target.value) : undefined})}
                                    size="small"
                                    sx={{width: 110}}
                                />
                                <TextField
                                    label="Agenda group"
                                    value={rule.agendaGroup ?? ''}
                                    onChange={e => updateRule({agendaGroup: e.target.value || undefined})}
                                    size="small"
                                    sx={{width: 180}}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!rule.noLoop}
                                            onChange={e => updateRule({noLoop: e.target.checked || undefined})}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">no-loop</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!rule.lockOnActive}
                                            onChange={e => updateRule({lockOnActive: e.target.checked || undefined})}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">lock-on-active</Typography>}
                                />
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Imports */}
                <Accordion defaultExpanded variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                        <Typography variant="subtitle1" sx={{fontWeight: 600, textTransform: 'uppercase'}}>
                            Imports
                            {file.imports.length > 0 && (
                                <Typography component="span" variant="caption" sx={{ml: 1, color: 'text.secondary'}}>
                                    ({file.imports.length})
                                </Typography>
                            )}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{gap: 1}}>
                            <Stack sx={{flexDirection: 'row', gap: 1, flexWrap: 'wrap'}}>
                                {file.imports.map((imp, i) => (
                                    <Chip
                                        key={i}
                                        label={imp}
                                        size="small"
                                        onDelete={() => updateFile({imports: file.imports.filter((_, j) => j !== i)})}
                                        deleteIcon={<Delete fontSize="small"/>}
                                        sx={{fontFamily: 'monospace', fontSize: '0.75rem'}}
                                    />
                                ))}
                            </Stack>
                            <Stack direction={"row"} sx={{justifyContent: 'space-between'}}>
                                <Autocomplete
                                    freeSolo={true}
                                    fullWidth={true}
                                    options={Object.values(KNOWN_IMPORTS)}
                                    onChange={(_, value) => setNextImport(value)}
                                    onInputChange={(_, value) => setNextImport(value)}
                                    size="small"
                                    sx={{maxWidth: 480}}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Add import"
                                                   placeholder="eu.trentorise.game.model.PointConcept" size="small"/>
                                    )}
                                />
                                <Tooltip title="Add an import statement">
                                    <Button size="small" startIcon={<Add/>} onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        if (nextImport && !file.imports.includes(nextImport)) {
                                            updateFile({imports: [...file.imports, nextImport]})
                                            setNextImport(null)
                                        }
                                    }}>
                                        Add Import
                                    </Button>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                {/* Conditions */}
                <Accordion defaultExpanded variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                        <Typography variant="subtitle1" sx={{fontWeight: 600, textTransform: 'uppercase'}}>
                            WHEN
                            {rule.conditions.length > 0 && (
                                <Typography component="span" variant="caption" sx={{ml: 1, color: 'text.secondary'}}>
                                    ({rule.conditions.length})
                                </Typography>
                            )}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{gap: 2}}>
                            {rule.conditions.length === 0 && (
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    No conditions — rule fires on every execution.
                                </Typography>
                            )}
                            {rule.conditions.map((condition, i) => (
                                <ConditionEditor
                                    key={i}
                                    condition={condition}
                                    onChange={c => updateCondition(i, c)}
                                    onDelete={() => removeCondition(i)}
                                />
                            ))}
                            <Button size="small" startIcon={<Add/>} onClick={addCondition}
                                    sx={{alignSelf: 'flex-start'}}>
                                Add condition
                            </Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                {/* Consequences */}
                <Accordion defaultExpanded variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                        <Typography variant="subtitle1" sx={{fontWeight: 600, textTransform: 'uppercase'}}>
                            THEN
                            {rule.consequences.length > 0 && (
                                <Typography component="span" variant="caption" sx={{ml: 1, color: 'text.secondary'}}>
                                    ({rule.consequences.length})
                                </Typography>
                            )}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{gap: 2}}>
                            {rule.consequences.length === 0 && (
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>No consequences.</Typography>
                            )}
                            {rule.consequences.map((consequence, i) => (
                                <ConsequenceEditor
                                    key={i}
                                    consequence={consequence}
                                    bindings={bindings}
                                    onChange={c => updateConsequence(i, c)}
                                    onDelete={() => removeConsequence(i)}
                                />
                            ))}
                            <Button size="small" startIcon={<Add/>} onClick={addConsequence}
                                    sx={{alignSelf: 'flex-start'}}>
                                Add consequence
                            </Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                {/* Save */}
                <Stack sx={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!rule.name.trim() || !file.imports.length}
                    >
                        Save rule
                    </Button>
                </Stack>
            </Stack>

            {/* ─── Right: DRL preview (30%) ──────────────────────────────────────── */}
            <Box sx={{flex: '0 0 30%', position: 'sticky', top: 16}}>
                <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                    DRL Preview
                </Typography>

                {drlError && (
                    <Typography variant="body2" sx={{color: 'error.main', mb: 1}}>
                        {drlError}
                    </Typography>
                )}

                <Box
                    component="pre"
                    sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        m: 0,
                        minHeight: 120,
                        color: drlPreview ? 'text.primary' : 'text.disabled',
                    }}
                >
                    {drlPreview ?? '// Start building your rule...'}
                </Box>
            </Box>

        </Stack>
    )
}
