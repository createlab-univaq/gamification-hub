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
import {useTranslation} from "react-i18next";

interface ActionFormProps {
    gameId: string
    action?: string
}

export function ActionForm({action, gameId}: ActionFormProps) {

    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
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
                    title: t("actions.save_title"),
                    content: t("actions.save_message", {name: data.name})
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
                    required: t("required_field")
                }}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={t("name")}/>
            </FormInput>
            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={`/games/${gameId}/actions`} variant={"contained"}>{t("buttons:turn_back")}</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>{t("buttons:save")}</Button>
                    <Button type={"reset"} onClick={() => initForm(action)} variant={"outlined"}>{t("buttons:reset")}</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}