import { TextField } from '@mui/material'

interface RawCodeInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}

export function RawCodeInput({ label = 'Raw DRL', value, onChange, rows = 3, placeholder }: RawCodeInputProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      multiline
      rows={rows}
      fullWidth
      size="small"
      placeholder={placeholder}
      slotProps={{
        input: {
          sx: {
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          },
        },
      }}
    />
  )
}
