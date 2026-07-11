import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {playerClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Button, Stack, TextField} from "@mui/material";
import type {PlayerDto} from "../../api/types";
import {useTranslation} from "react-i18next";

interface PlayerFormProps {
    gameId: string
}

export function PlayerForm({gameId}: PlayerFormProps) {

    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const form = useForm({
        defaultValues: {
            playerId: ""
        }
    })

    const {mutate, isPending} = useMutation<PlayerDto, Error, { gameId: string, player: PlayerDto }>({
        mutationKey: ["create-player", gameId],
        mutationFn: ({gameId, player}) => playerClient.addPlayer(gameId, player),
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/players`, {
                state: {
                    type: "success",
                    title: t("players.saved.title"),
                    content: t("players.saved.message", {name: data.playerId})
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

    return <Form form={form}
                 onSubmit={(fieldValues) => mutate({gameId: gameId, player: {...fieldValues, gameId}})}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"playerId"}
                rules={{
                    required: t("required_field")
                }}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={t("players.form.player_name")}/>
            </FormInput>
            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={`/games/${gameId}/players`} variant={"contained"}>{t("buttons:turn_back")}</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>{t("buttons:save")}</Button>
                    <Button type={"reset"} onClick={() => form.reset({playerId: ""})}
                            variant={"outlined"}>{t("buttons:reset")}</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
