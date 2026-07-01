import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {playerClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Button, Stack, TextField} from "@mui/material";

interface PlayerFormProps {
    gameId: string
}

export function PlayerForm({gameId}: PlayerFormProps) {

    const {setNotification} = useNotificationContext()
    const form = useForm({
        defaultValues: {
            playerId: ""
        }
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ["create-player", gameId],
        mutationFn: ({gameId, player}) => playerClient.addPlayer(gameId, player),
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/players`, {
                state: {
                    type: "success",
                    title: `Giocatore Salvato!`,
                    content: `Il giocatore ${data.playerId} è stato salvato con successo`
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
                    required: "Campo obbligatorio!"
                }}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={"Nome giocatore"}/>
            </FormInput>
            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={`/games/${gameId}/players`} variant={"contained"}>Indietro</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>Salva</Button>
                    <Button type={"reset"} onClick={() => form.reset({playerId: ""})} variant={"outlined"}>Reset</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
