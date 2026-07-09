import {useForm} from "react-hook-form";
import {useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {playerChallengeClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Button, Dialog, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import type {ChallengeConceptDto, ChallengeEditDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {toIsoDate} from "../../utils/date-utils.ts";
import {FormCheckbox} from "./FormCheckbox.tsx";

interface ChallengeEditFormProps {
    gameId: string
    playerId: string
    challenge?: ChallengeConceptDto
    onClose: () => void
}

type EditFormValues = {
    start: string
    end: string
    hide: boolean
}

export function ChallengeEditForm({gameId, playerId, challenge, onClose}: ChallengeEditFormProps) {

    const {setNotification} = useNotificationContext()
    const form = useForm<EditFormValues>({
        defaultValues: {start: "", end: "", hide: false}
    })
    const [t] = useTranslation();

    useEffect(() => {
        if (challenge) {
            form.reset({
                start: challenge.start ?? "",
                end: challenge.end ?? "",
                hide: false
            })
        }
    }, [challenge]);

    const {mutate, isPending} = useMutation({
        mutationKey: ["edit-challenge", gameId, playerId, challenge?.name],
        mutationFn: (values: EditFormValues) => {
            const payload: ChallengeEditDto = {
                start: toIsoDate(values.start),
                end: toIsoDate(values.end),
                hide: values.hide
            }
            return playerChallengeClient.editChallenge(gameId, playerId, challenge!.name!, payload)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ["get-player", gameId, playerId]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("challenges.saved.title"),
                    content: t("challenges.saved.message", {name: data.name})
                },
                isSnack: true
            })
            onClose()
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
        }
    })

    return <Dialog open={!!challenge} onClose={onClose} fullWidth={true} maxWidth={"xs"}>
        <DialogTitle>{t("buttons:update")} {challenge?.name ?? ""}</DialogTitle>
        <DialogContent>
            <Form form={form} onSubmit={(values) => mutate(values as EditFormValues)} readonly={isPending}>
                <Stack sx={{gap: 3, pt: 1}}>
                    <FormInput name={"start"}>
                        <TextField label={t("form.labels.start")} fullWidth={true} type={"date"}
                                   slotProps={{inputLabel: {shrink: true}}}/>
                    </FormInput>
                    <FormInput name={"end"}>
                        <TextField label={t("form.labels.end")} fullWidth={true} type={"date"}
                                   slotProps={{inputLabel: {shrink: true}}}/>
                    </FormInput>
                    <FormCheckbox name={"hide"} label={t("form.labels.hidden")} labelPlacement={"end"}/>

                    <Stack direction={"row"} sx={{justifyContent: "flex-end", gap: 2}}>
                        <Button variant={"outlined"} onClick={onClose}>{t("buttons:cancel")}</Button>
                        <Button type={"submit"} variant={"contained"} loading={isPending}>{t("buttons:save")}</Button>
                    </Stack>
                </Stack>
            </Form>
        </DialogContent>
    </Dialog>

}
