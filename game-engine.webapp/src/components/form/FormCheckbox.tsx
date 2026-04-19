import {Checkbox, FormControlLabel} from "@mui/material";
import {Controller, useFormContext} from "react-hook-form";
import type {FormInputProps} from "./FormInput.tsx";

interface FormCheckboxProps extends Omit<FormInputProps, "children"> {
    label?: string
    labelPlacement?:"end" | "start" | "top" | "bottom"
}

export function FormCheckbox({name, defaultValue, disabled, rules, label, labelPlacement,...rest}: FormCheckboxProps) {

    const {control} = useFormContext()

    return <Controller
        name={name}
        control={control}
        rules={rules}
        {...rest}
        disabled={disabled}
        defaultValue={defaultValue}
        render={({field}) => (
            <FormControlLabel
                control={
                    <Checkbox
                        {...field}
                        defaultValue={defaultValue}
                        defaultChecked={defaultValue}
                        checked={field.value}
                        disabled={disabled}
                    />
                }
                label={label}
                labelPlacement={labelPlacement ?? "end"}
            />
        )}
    />
}