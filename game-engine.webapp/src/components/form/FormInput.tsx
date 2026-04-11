import type {ControllerProps, FieldPath, FieldValues} from "react-hook-form"
import {Controller, useFormContext} from "react-hook-form";
import React, {ReactElement} from "react";


interface FormInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps, "render"> {
    children: ReactElement;
}

export function FormInput<T>({
                                 name,
                                 defaultValue,
                                 rules,
                                 children,
                                 ...rest
                             }: FormInputProps) {

    const {control} = useFormContext<T>()

    return <Controller name={name}
                       control={control}
                       defaultValue={defaultValue}
                       rules={rules}
                       {...rest}
                       render={({formState, fieldState, field}) => {
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