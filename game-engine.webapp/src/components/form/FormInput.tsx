import type {ControllerProps, FieldValues} from "react-hook-form"
import {Controller, useFormContext} from "react-hook-form";
import React, {type ReactElement} from "react";


export interface FormInputProps<T extends FieldValues> extends Omit<ControllerProps<T>, "render" | "control"> {
    children: ReactElement;
}

export function FormInput<T extends FieldValues>({
                                                     name,
                                                     defaultValue,
                                                     rules,
                                                     children,
                                                     ...rest
                                                 }: FormInputProps<T>) {

    const {control} = useFormContext<T>()

    return <Controller name={name}
                       control={control}
                       defaultValue={defaultValue}
                       rules={rules}
                       {...rest}
                       render={({fieldState, field}) => {
                           return React.cloneElement(children, {
                               ...field,
                               key: name,
                               defaultValue: defaultValue,
                               error: !!fieldState.error,
                               helperText: fieldState.error ? fieldState.error.message : children.props.helperText,
                           })
                       }}
    />

}