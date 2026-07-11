import type {FieldValues, UseFormReturn} from "react-hook-form";
import {FormProvider} from "react-hook-form";
import type {PropsWithChildren} from "react";

interface AppFormProps<T extends FieldValues> {
    form: UseFormReturn<T>
    onSubmit: (fieldValues: FieldValues) => void
    readonly?: boolean
}

export function Form<T extends FieldValues>({form, onSubmit, readonly, children}: PropsWithChildren<AppFormProps<T>>) {

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={readonly}>
                {children}
            </fieldset>
        </form>
    </FormProvider>

}