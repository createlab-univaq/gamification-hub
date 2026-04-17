import type {GameDto} from "../api/types";
import type {FieldValues} from "react-hook-form";
import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {gameClient} from "../api";
import {getApiError, translateApiErrorToNotification} from "../utils/error-utils.ts";
import {useEffect} from "react";
import {Form} from "./form/Form.tsx";
import {Button, Stack, TextField} from "@mui/material";
import {FormInput} from "./form/FormInput.tsx";
import {navigateTo} from "../utils/navigation-utils.ts";
import {useNotificationContext} from "./notification/NotificationProvider.tsx";

export interface GameFormProps {
    game?: GameDto
}

export function GameForm({game}: GameFormProps) {

    const form = useForm<GameDto>({
        defaultValues: {
            name: "",
            domain: ""
        }
    })
    const {setNotification} = useNotificationContext()

    const {mutate, isPending} = useMutation({
        mutationFn: (request) => {
            if (game) {
                return gameClient.updateGame(game.id, request)
            }
            return gameClient.addGame(request)
        },
        onSuccess: (data) => {
            navigateTo("/dashboard", {
                state: {
                    type: "success",
                    title: `Gioco salvato!`,
                    content: `Il gioco ${data.name} è stato salvato con successo`
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

    useEffect(() => {
        if (game) {
            initForm(game)
        }
    }, [game]);

    const initForm = (game: GameDto) => {
        form.reset({
            ...game
        })
    }

    function handleSubmit(fieldValues: FieldValues) {
        mutate(fieldValues)
    }

    return <Form form={form} onSubmit={handleSubmit} readonly={isPending}>
        <Stack sx={{gap: 3}}>
            <Stack sx={{gap: 2}}>
                <FormInput name={"name"}
                           rules={{
                               required: "Required field!"
                           }}
                >
                    <TextField type={"text"} label={"Name"} placeholder={"Half life 3"} fullWidth={true}/>
                </FormInput>
                <FormInput name={"domain"}
                           rules={{
                               required: "Required field!"
                           }}
                >
                    <TextField type={"text"} label={"Domain"} placeholder={"ilmiodominio.com"} fullWidth={true}/>
                </FormInput>
            </Stack>
            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={"/dashboard"} variant={"contained"}>Back</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>Save</Button>
                    <Button type={"reset"} onClick={() => initForm(game)} variant={"outlined"}>Reset</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}