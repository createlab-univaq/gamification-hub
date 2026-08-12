import {Autocomplete, autocompleteClasses, TextField} from "@mui/material";
import type {SxProps, Theme} from "@mui/material";
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
    // Keeps values that are not in the options list, and lets the user type their own.
    freeSolo?: boolean
    required?: boolean
    fullWidth?: boolean
    size?: "small" | "medium"
    sx?: SxProps<Theme>
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
                                        }: AutocompleteFormItemProps<T>) {
    const {control} = useFormContext()
    const toValue = getOptionValue ?? ((option: T) => option as unknown)
    const labelOf = (option: T | string) => typeof option === "string" ? option : getOptionLabel(option)
    const valueOf = (option: T | string) => typeof option === "string" ? option : toValue(option)

    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({field, fieldState}) => {
            // Resolve the option object that corresponds to a stored value. Under freeSolo an
            // unmatched value is kept as typed, so editing a saved record cannot silently drop it.
            const resolve = (stored: unknown): T | string | null => {
                const match = options.find(o => toValue(o) === stored)
                if (match !== undefined) {
                    return match
                }
                if (freeSolo && typeof stored === "string" && stored !== "") {
                    return stored
                }
                return null
            }
            const selected = multiple
                ? (Array.isArray(field.value) ? field.value.map(resolve).filter(v => v !== null) : [])
                : resolve(field.value)

            return <Autocomplete<T, boolean, false, boolean>
                multiple={multiple}
                disabled={disabled}
                loading={loading}
                freeSolo={freeSolo}
                // Chips only: turns typed text into a chip on blur. Left off for single-select,
                // where it would commit whichever option the mouse last passed over.
                autoSelect={!!(freeSolo && multiple)}
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
                onInputChange={freeSolo && !multiple
                    ? (_, newInput, reason) => {
                        if (reason === "input") {
                            field.onChange(newInput)
                        }
                    }
                    : undefined}
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
