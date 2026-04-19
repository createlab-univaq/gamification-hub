import {useEffect, useState} from 'react'
import {
  Autocomplete, Button, Card, CardContent, IconButton, MenuItem,
  Select, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import type { Consequence, Modification } from 'drools-builder'
import { RawCodeInput } from './RawCodeInput'
import { normalizeBinding } from './utils'
import { useDebounced } from '../../hooks/use-debounced'

const CONSEQUENCE_KINDS = [
  { value: 'ModifyConsequence',    label: 'Modify' },
  { value: 'InsertConsequence',    label: 'Insert' },
  { value: 'RetractConsequence',   label: 'Retract' },
  { value: 'SetGlobalConsequence', label: 'Global call' },
  { value: 'RawConsequence',       label: 'Raw' },
]

interface ConsequenceEditorProps {
  consequence: Consequence
  bindings: string[]
  onChange: (consequence: Consequence) => void
  onDelete: () => void
}

export function ConsequenceEditor({ consequence: initialConsequence, bindings, onChange, onDelete }: ConsequenceEditorProps) {
  const [consequence, setConsequence] = useState<Consequence>(initialConsequence)
  const debouncedOnChange = useDebounced(onChange, 300)

  // Update condition if initialCondition changes
  useEffect(() => {
    setConsequence(initialConsequence)
  }, [initialConsequence]);

  const handleChange = (next: Consequence) => {
    setConsequence(next)
    debouncedOnChange(next)
  }

  const changeKind = (kind: string) => {
    const firstBinding = bindings[0] ?? '$var'
    if (kind === 'ModifyConsequence')         handleChange({ kind: 'ModifyConsequence', binding: firstBinding, modifications: [] })
    else if (kind === 'InsertConsequence')    handleChange({ kind: 'InsertConsequence', objectExpression: '' })
    else if (kind === 'RetractConsequence')   handleChange({ kind: 'RetractConsequence', binding: firstBinding })
    else if (kind === 'SetGlobalConsequence') handleChange({ kind: 'SetGlobalConsequence', expression: '' })
    else                                      handleChange({ kind: 'RawConsequence', code: '' })
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack sx={{ gap: 2 }}>
          <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Select
              value={consequence.kind}
              onChange={e => changeKind(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              {CONSEQUENCE_KINDS.map(k => (
                <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>
              ))}
            </Select>
            <Tooltip title="Remove consequence">
              <IconButton size="small" color="error" onClick={onDelete}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {consequence.kind === 'ModifyConsequence' && (
            <ModifyEditor consequence={consequence} bindings={bindings} onChange={handleChange} />
          )}

          {consequence.kind === 'InsertConsequence' && (
            <RawCodeInput
              label="Object expression"
              value={consequence.objectExpression}
              onChange={v => handleChange({ ...consequence, objectExpression: v })}
              rows={1}
              placeholder='new Notification($player.getId(), "msg")'
            />
          )}

          {consequence.kind === 'RetractConsequence' && (
            <BindingSelect
              label="Binding to retract"
              value={consequence.binding}
              bindings={bindings}
              onChange={v => handleChange({ ...consequence, binding: v })}
            />
          )}

          {consequence.kind === 'SetGlobalConsequence' && (
            <RawCodeInput
              label="Expression"
              value={consequence.expression}
              onChange={v => handleChange({ ...consequence, expression: v })}
              rows={1}
              placeholder='utils.log("message")'
            />
          )}

          {consequence.kind === 'RawConsequence' && (
            <RawCodeInput
              label="Raw code"
              value={consequence.code}
              onChange={v => handleChange({ ...consequence, code: v })}
              rows={3}
              placeholder="// any valid Java/MVEL code"
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

// ─── Modify sub-editor ────────────────────────────────────────────────────────

interface ModifyEditorProps {
  consequence: Extract<Consequence, { kind: 'ModifyConsequence' }>
  bindings: string[]
  onChange: (consequence: Consequence) => void
}

function ModifyEditor({ consequence, bindings, onChange }: ModifyEditorProps) {
  const addMethod = () => {
    onChange({ ...consequence, modifications: [...consequence.modifications, { method: '', args: [] }] })
  }

  const updateMethod = (index: number, mod: Modification) => {
    const modifications = [...consequence.modifications]
    modifications[index] = mod
    onChange({ ...consequence, modifications })
  }

  const removeMethod = (index: number) => {
    onChange({ ...consequence, modifications: consequence.modifications.filter((_, i) => i !== index) })
  }

  return (
    <Stack sx={{ gap: 2 }}>
      <BindingSelect
        label="Binding to modify"
        value={consequence.binding}
        bindings={bindings}
        onChange={v => onChange({ ...consequence, binding: v })}
      />
      <Stack sx={{ gap: 1 }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">Method calls</Typography>
          <Button size="small" startIcon={<Add />} onClick={addMethod}>Add method</Button>
        </Stack>
        {consequence.modifications.map((mod, i) => (
          <MethodEditor
            key={i}
            modification={mod}
            onChange={m => updateMethod(i, m)}
            onDelete={() => removeMethod(i)}
          />
        ))}
      </Stack>
    </Stack>
  )
}

// ─── Method call editor ───────────────────────────────────────────────────────

interface MethodEditorProps {
  modification: Modification
  onChange: (mod: Modification) => void
  onDelete: () => void
}

function MethodEditor({ modification, onChange, onDelete }: MethodEditorProps) {
  const addArg = () => {
    onChange({ ...modification, args: [...modification.args, ''] })
  }

  const updateArg = (index: number, value: string) => {
    const args = [...modification.args]
    args[index] = value
    onChange({ ...modification, args })
  }

  const removeArg = (index: number) => {
    onChange({ ...modification, args: modification.args.filter((_, i) => i !== index) })
  }

  return (
    <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
      <TextField
        label="Method"
        value={modification.method}
        onChange={e => onChange({ ...modification, method: e.target.value })}
        size="small"
        sx={{ width: 150 }}
        placeholder="setScore"
      />
      <Stack sx={{ gap: 1, flex: 1 }}>
        {modification.args.map((arg, i) => (
          <Stack key={i} sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
            {/* args are raw strings — covers literals, vars, expressions */}
            <TextField
              value={arg}
              onChange={e => updateArg(i, e.target.value)}
              size="small"
              fullWidth
              placeholder="$pc.getScore() + 10"
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}/>
            <Tooltip title="Remove arg">
              <IconButton size="small" onClick={() => removeArg(i)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ))}
        <Button size="small" onClick={addArg} sx={{ alignSelf: 'flex-start' }}>+ arg</Button>
      </Stack>
      <Tooltip title="Remove method">
        <IconButton size="small" color="error" onClick={onDelete}>
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

// ─── Shared binding selector ──────────────────────────────────────────────────

interface BindingSelectProps {
  label: string
  value: string
  bindings: string[]
  onChange: (value: string) => void
}

function BindingSelect({ label, value, bindings, onChange }: BindingSelectProps) {
  return (
    <Autocomplete
      freeSolo
      options={bindings}
      value={value}
      onChange={(_, v) => onChange(normalizeBinding(v ?? ''))}
      onInputChange={(_, v) => onChange(normalizeBinding(v))}
      size="small"
      sx={{ minWidth: 160 }}
      renderInput={(params) => <TextField {...params} label={label} placeholder="$var" />}
    />
  )
}
