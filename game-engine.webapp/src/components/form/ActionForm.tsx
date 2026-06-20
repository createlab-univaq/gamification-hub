import {useForm} from "react-hook-form";
import React, {useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {actionClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Button, Stack, TextField} from "@mui/material";

interface ActionFormProps {
    gameId: string
    action?: string
}

export function ActionForm({action, gameId}: ActionFormProps) {

    const {setNotification} = useNotificationContext()
    const form = useForm({
        defaultValues: {
            name: ""
        }
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ["upsert-action", gameId, action],
        mutationFn: ({gameId, newAction}) => {
            if (action) {
                return actionClient.updateAction(gameId, action, newAction)
            }
            return actionClient.addAction(gameId, newAction)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/actions`, {
                state: {
                    type: "success",
                    title: `Azione Salvata!`,
                    content: `L'azione ${data.name} è stata salvata con successo`
                }
            })
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({
                notification: translateApiErrorToNotification(apiError),
                isSnack: true
            })
        }
    })

    function initForm(action) {
        form.reset({
            name:action
        })
    }

    useEffect(() => {
        if (action) {
            initForm(action)
        }
    }, [action]);

    return <Form form={form}
                 onSubmit={(fieldValues) => mutate({gameId: gameId, newAction: fieldValues})}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"name"}
                rules={{
                    required: "Campo obbligatorio!"
                }}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={"Nome"}/>
            </FormInput>
            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={`/games/${gameId}/actions`} variant={"contained"}>Indietro</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>Salva</Button>
                    <Button type={"reset"} onClick={() => initForm(action)} variant={"outlined"}>Reset</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}