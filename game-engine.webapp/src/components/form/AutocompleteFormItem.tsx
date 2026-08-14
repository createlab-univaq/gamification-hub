import {Autocomplete, autocompleteClasses, TextField} from "@mui/material";
import type {SxProps, Theme} from "@mui/material";
import type {RegisterOptions} from "react-hook-form";
import {Controller, useFormContext} from "react-hook-form";

// Shared so that an empty multi-select keeps the same value across renders.
const NOTHING_SELECTED: never[] = []

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
    // Keeps values that are not in the options list, and lets the user type their own.
    freeSolo?: boolean
    required?: boolean
    fullWidth?: boolean
    size?: "small" | "medium"
    sx?: SxProps<Theme>
    // Notified of what the user types, so the options can be fetched as they search.
    onInputChange?: (input: string) => void
    // Hides options that are already picked. Only meaningful with multiple.
    filterSelectedOptions?: boolean
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
                                            freeSolo,
                                            required,
                                            fullWidth,
                                            size,
                                            sx,
                                            onInputChange,
                                            filterSelectedOptions,
                                        }: AutocompleteFormItemProps<T>) {
    const {control} = useFormContext()
    const toValue = getOptionValue ?? ((option: T) => option as unknown)
    const valueOf = (option: T | string) => typeof option === "string" ? option : toValue(option)
    // What the form stores is not an option but the value extracted from one, so label it by
    // looking the option back up. Free text typed under freeSolo matches nothing and is shown
    // as it was typed.
    const labelOf = (option: T | string) => {
        const match = options.find(o => valueOf(o) === valueOf(option))
        if (match !== undefined) {
            return getOptionLabel(match)
        }
        return typeof option === "string" ? option : getOptionLabel(option)
    }

    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({field, fieldState}) => {
            // Handed straight to Autocomplete rather than resolved into options first: deriving it
            // would produce a new value on every render, and Autocomplete discards whatever is
            // being typed whenever the identity of value changes.
            const selected = multiple
                ? (Array.isArray(field.value) ? field.value : NOTHING_SELECTED)
                : (field.value ?? null)

            return <Autocomplete<T, boolean, false, boolean>
                multiple={multiple}
                disabled={disabled}
                loading={loading}
                freeSolo={freeSolo}
                // Chips only: turns typed text into a chip on blur. Left off for single-select,
                // where it would commit whichever option the mouse last passed over.
                autoSelect={!!(freeSolo && multiple)}
                // Highlights the closest option as the user types, so Enter picks it. Kept off
                // under freeSolo, where it would let a blur commit an option over typed text.
                autoHighlight={!freeSolo}
                filterSelectedOptions={filterSelectedOptions}
                fullWidth={fullWidth ?? true}
                size={size}
                // minWidth lets it shrink below its content, so chips and long labels wrap
                // instead of forcing the row wider than its flex share.
                sx={[{minWidth: 0}, ...(Array.isArray(sx) ? sx : [sx])]}
                // Options are overflow:hidden with no ellipsis by default, so a label wider
                // than the popup is silently cut. Let it wrap onto more lines instead.
                slotProps={{
                    listbox: {
                        sx: {
                            [`& .${autocompleteClasses.option}`]: {
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                            }
                        }
                    }
                }}
                options={options}
                value={selected as never}
                getOptionLabel={labelOf}
                isOptionEqualToValue={(opt, val) => valueOf(opt) === valueOf(val)}
                onChange={(_, newValue) => {
                    if (multiple) {
                        field.onChange(((newValue ?? []) as (T | string)[]).map(valueOf))
                    } else {
                        field.onChange(newValue === null || newValue === undefined
                            ? null
                            : valueOf(newValue as T | string))
                    }
                }}
                onInputChange={(_, newInput, reason) => {
                    if (reason !== "input") {
                        return
                    }
                    onInputChange?.(newInput)
                    if (freeSolo && !multiple) {
                        field.onChange(newInput)
                    }
                }}
                onBlur={field.onBlur}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        inputRef={field.ref}
                        label={label}
                        placeholder={placeholder}
                        required={required}
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : undefined}
                    />
                )}
            />
        }}
    />
}
