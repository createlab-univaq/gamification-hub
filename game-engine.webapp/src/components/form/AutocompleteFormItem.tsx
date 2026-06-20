import {Autocomplete, TextField} from "@mui/material";
import type {RegisterOptions} from "react-hook-form";
import {Controller, useFormContext} from "react-hook-form";

interface AutocompleteFormItemProps<T> {
    name: string
    options: T[]
    getOptionLabel: (option: T) => string
    // What gets stored in the form for a chosen option. Defaults to the option itself.
    getOptionValue?: (option: T) => unknown
    label?: string
    placeholder?: string
    rules?: RegisterOptions
    loading?: boolean
    multiple?: boolean
    disabled?: boolean
}

export function AutocompleteFormItem<T>({
                                            name,
                                            options,
                                            getOptionLabel,
                                            getOptionValue,
                                            label,
                                            placeholder,
                                            rules,
                                            loading,
                                            multiple,
                                            disabled,
                                        }: AutocompleteFormItemProps<T>) {
    const {control} = useFormContext()
    const toValue = getOptionValue ?? ((option: T) => option as unknown)

    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({field, fieldState}) => {
            // Resolve the option object(s) that correspond to the stored value(s)
            const selected = multiple
                ? options.filter(o => Array.isArray(field.value) && field.value.some(v => v === toValue(o)))
                : options.find(o => toValue(o) === field.value) ?? null

            return <Autocomplete<T, boolean, false, false>
                multiple={multiple}
                disabled={disabled}
                loading={loading}
                options={options}
                value={selected}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={(opt, val) => toValue(opt) === toValue(val)}
                onChange={(_, newValue) => {
                    if (multiple) {
                        field.onChange((newValue as T[]).map(toValue))
                    } else {
                        field.onChange(newValue ? toValue(newValue as T) : null)
                    }
                }}
                onBlur={field.onBlur}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        inputRef={field.ref}
                        label={label}
                        placeholder={placeholder}
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : undefined}
                    />
                )}
            />
        }}
    />
}
