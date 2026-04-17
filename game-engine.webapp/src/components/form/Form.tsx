import type {FieldValues, UseFormReturn} from "react-hook-form";
import {FormProvider} from "react-hook-form";
import type {PropsWithChildren} from "react";

interface AppFormProps {
    form: UseFormReturn
    onSubmit: (fieldValues: FieldValues) => void
    readonly?: boolean
}

export function Form({form, onSubmit, readonly, children}: PropsWithChildren<AppFormProps>) {

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={readonly}>
                {children}
            </fieldset>
        </form>
    </FormProvider>

}