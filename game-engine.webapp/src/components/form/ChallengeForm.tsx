import {useForm, useFieldArray} from "react-hook-form";
import {useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {challengeClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Add, Delete} from "@mui/icons-material";
import {Button, IconButton, Stack, TextField, Typography} from "@mui/material";
import type {ChallengeDto} from "../../api/types";

interface ChallengeFormProps {
    gameId: string
    challenge?: ChallengeDto
}

type ChallengeFormValues = {
    name: string
    variables: { value: string }[]
}

function toFormValues(challenge?: ChallengeDto): ChallengeFormValues {
    return {
        name: challenge?.name ?? "",
        variables: (challenge?.variables ?? []).map(value => ({value}))
    }
}

export function ChallengeForm({gameId, challenge}: ChallengeFormProps) {

    const {setNotification} = useNotificationContext()
    const form = useForm<ChallengeFormValues>({
        defaultValues: toFormValues(challenge)
    })

    const variables = useFieldArray({control: form.control, name: "variables"})

    useEffect(() => {
        if (challenge) {
            form.reset(toFormValues(challenge))
        }
    }, [challenge]);

    const {mutate, isPending} = useMutation({
        mutationKey: ["upsert-challenge", gameId, challenge?.id],
        mutationFn: (values: ChallengeFormValues) => {
            const payload: ChallengeDto = {
                name: values.name,
                variables: values.variables.map(v => v.value.trim()).filter(Boolean)
            }
            return challenge?.id
                ? challengeClient.updateChallenge(gameId, challenge.id, payload)
                : challengeClient.addChallenge(gameId, payload)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/challenges`, {
                state: {
                    type: "success",
                    title: "Modello di sfida salvato!",
                    content: `Il modello di sfida ${data.name} è stato salvato con successo`
                }
            })
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    return <Form form={form}
                 onSubmit={(values) => mutate(values)}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"name"}
                rules={{required: "Campo obbligatorio!"}}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={"Nome"}/>
            </FormInput>

            <Stack sx={{gap: 1}}>
                <Typography sx={{fontWeight: 600}}>Variabili</Typography>
                {variables.fields.map((field, i) => (
                    <Stack key={field.id} direction={"row"} sx={{gap: 1, alignItems: "center"}}>
                        <TextField size={"small"} fullWidth={true} placeholder={"Nome variabile"}
                                   {...form.register(`variables.${i}.value`)}/>
                        <IconButton size={"small"} color={"error"} onClick={() => variables.remove(i)}>
                            <Delete fontSize={"small"}/>
                        </IconButton>
                    </Stack>
                ))}
                <Button size={"small"} startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                        onClick={() => variables.append({value: ""})}>
                    Aggiungi variabile
                </Button>
            </Stack>

            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                <Button href={`/games/${gameId}/challenges`} variant={"contained"}>Indietro</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>Salva</Button>
                    <Button type={"reset"} onClick={() => form.reset(toFormValues(challenge))}
                            variant={"outlined"}>Reset</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
