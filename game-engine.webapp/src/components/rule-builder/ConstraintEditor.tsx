import { Autocomplete, IconButton, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Delete } from '@mui/icons-material'
import type { Constraint, ConstraintOperator } from 'drools-builder'
import { RawCodeInput } from './RawCodeInput'
import { normalizeBinding } from './utils'

const OPERATORS: ConstraintOperator[] = [
  '==', '!=', '>', '<', '>=', '<=',
  'contains', 'not contains',
  'memberOf', 'not memberOf',
  'matches', 'not matches',
]

const CONSTRAINT_KINDS = [
  { value: 'FieldConstraint',   label: 'Field' },
  { value: 'BindingConstraint', label: 'Binding' },
  { value: 'RawConstraint',     label: 'Raw' },
]

interface ConstraintEditorProps {
  constraint: Constraint
  onChange: (constraint: Constraint) => void
  onDelete: () => void
}

export function ConstraintEditor({ constraint, onChange, onDelete }: ConstraintEditorProps) {
  const changeKind = (kind: string) => {
    if (kind === 'FieldConstraint')        onChange({ kind: 'FieldConstraint', field: '', operator: '==', value: '' })
    else if (kind === 'BindingConstraint') onChange({ kind: 'BindingConstraint', binding: '', field: '' })
    else                                   onChange({ kind: 'RawConstraint', expression: '' })
  }

  return (
    <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
      <Select
        value={constraint.kind}
        onChange={e => changeKind(e.target.value)}
        size="small"
        sx={{ minWidth: 90 }}
      >
        {CONSTRAINT_KINDS.map(k => (
          <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>
        ))}
      </Select>

      <Stack sx={{ flex: 1 }}>
        {constraint.kind === 'FieldConstraint' && (
          <Stack sx={{ flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              label="Field"
              value={constraint.field}
              onChange={e => onChange({ ...constraint, field: e.target.value })}
              size="small"
              sx={{ width: 140 }}
              placeholder="name"
            />
            <Autocomplete
              freeSolo
              options={OPERATORS}
              value={constraint.operator}
              onChange={(_, v) => onChange({ ...constraint, operator: (v ?? '==') as ConstraintOperator })}
              onInputChange={(_, v) => onChange({ ...constraint, operator: v as ConstraintOperator })}
              size="small"
              sx={{ minWidth: 140 }}
              renderInput={(params) => <TextField {...params} label="Operator" />}
            />
            {/* value is a raw string — covers literals, enums, bindings, expressions */}
            <TextField
              label="Value"
              value={constraint.value}
              onChange={e => onChange({ ...constraint, value: e.target.value })}
              size="small"
              sx={{ minWidth: 140 }}
              placeholder='"p1" or 50 or $var or Account.Status.ACTIVE'
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
            />
          </Stack>
        )}

        {constraint.kind === 'BindingConstraint' && (
          <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <TextField
              label="Binding ($var)"
              value={constraint.binding}
              onChange={e => onChange({ ...constraint, binding: normalizeBinding(e.target.value) })}
              size="small"
              sx={{ width: 130 }}
              placeholder="$total"
            />
            <Typography sx={{ alignSelf: 'center' }}>:</Typography>
            <TextField
              label="Field"
              value={constraint.field}
              onChange={e => onChange({ ...constraint, field: e.target.value })}
              size="small"
              sx={{ width: 130 }}
              placeholder="score"
            />
          </Stack>
        )}

        {constraint.kind === 'RawConstraint' && (
          <RawCodeInput
            label="Expression"
            value={constraint.expression}
            onChange={v => onChange({ ...constraint, expression: v })}
            rows={1}
            placeholder='fields.get("key") != null'
          />
        )}
      </Stack>

      <Tooltip title="Remove constraint">
        <IconButton size="small" onClick={onDelete} color="error">
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

