import {useFieldArray, useForm} from "react-hook-form";
import {useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {challengeClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Add, ArrowBack, Delete, RestartAlt, Save} from "@mui/icons-material";
import {Button, IconButton, Stack, TextField, Typography} from "@mui/material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import type {ChallengeDto} from "../../api/types";
import {useTranslation} from "react-i18next";

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
    const [t] = useTranslation()
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
                    title: t("challenges.saved.title"),
                    content: t("challenges.saved.message", {name: data.name})
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
                 onSubmit={(values) => mutate(values as ChallengeFormValues)}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"name"}
                rules={{required: t("required_field")}}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={t("name")}/>
            </FormInput>

            <Stack sx={{gap: 1}}>
                <Typography sx={{fontWeight: 600}}>{t("challenges.form.variables_title")}</Typography>
                {variables.fields.map((field, i) => (
                    <Stack key={field.id} direction={"row"} sx={{gap: 1, alignItems: "center"}}>
                        <TextField size={"small"} fullWidth={true} placeholder={t("challenges.form.variable_name")}
                                   {...form.register(`variables.${i}.value`)}/>
                        <IconButton size={"small"} color={"error"} onClick={() => variables.remove(i)}>
                            <Delete fontSize={"small"}/>
                        </IconButton>
                    </Stack>
                ))}
                <Button size={"small"} startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                        onClick={() => variables.append({value: ""})}>
                    {t("challenges.form.add_variable")}
                </Button>
            </Stack>

            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                <ButtonIcon icon={<ArrowBack/>} href={`/games/${gameId}/challenges`} variant={"contained"}>{t("buttons:turn_back")}</ButtonIcon>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <ButtonIcon type={"submit"} icon={<Save/>} variant={"contained"}>{t("buttons:save")}</ButtonIcon>
                    <ButtonIcon type={"button"} icon={<RestartAlt/>} onClick={() => form.reset(toFormValues(challenge))}
                            variant={"outlined"}>{t("buttons:reset")}</ButtonIcon>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
