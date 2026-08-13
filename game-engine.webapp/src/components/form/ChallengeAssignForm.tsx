import {useForm} from "react-hook-form";
import {useMutation, useQuery} from "@tanstack/react-query";
import {challengeClient, playerChallengeClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {Dialog, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import {AssignmentTurnedIn, Close} from "@mui/icons-material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import type {ChallengeAssignmentDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {FormCheckbox} from "./FormCheckbox.tsx";
import {toIsoDate} from "../../utils/date-utils.ts";
import {ASSIGNABLE_CHALLENGE_STATES} from "../../utils/enum-utils.ts";

interface ChallengeAssignFormProps {
    gameId: string
    playerId: string
    open: boolean
    onClose: () => void
}

type AssignFormValues = {
    modelName: string
    instanceName: string
    challengeType: string
    start: string
    end: string
    hide: boolean
}

export function ChallengeAssignForm({gameId, playerId, open, onClose}: ChallengeAssignFormProps) {

    const {setNotification} = useNotificationContext()
    const form = useForm<AssignFormValues>({
        defaultValues: {modelName: "", instanceName: "", challengeType: "ASSIGNED", start: "", end: "", hide: false}
    })
    const [t] = useTranslation()

    const {data: models, isLoading: modelsLoading} = useQuery({
        queryKey: ["get-challenges", gameId],
        queryFn: () => challengeClient.getChallenges(gameId),
        enabled: !!gameId && open
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ["assign-challenge", gameId, playerId],
        mutationFn: (values: AssignFormValues) => {
            const payload: ChallengeAssignmentDto = {
                modelName: values.modelName,
                instanceName: values.instanceName || undefined,
                challengeType: values.challengeType,
                start: toIsoDate(values.start),
                end: toIsoDate(values.end),
                hide: values.hide
            }
            return playerChallengeClient.assignChallenge(gameId, playerId, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-player", gameId, playerId]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("players.challenges.assigned.title"),
                    content: t("players.challenges.assigned.title")
                },
                isSnack: true
            })
            form.reset()
            onClose()
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
        }
    })

    return <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={"sm"}>
        <DialogTitle>{t("form.labels.assign_challenge")}</DialogTitle>
        <DialogContent>
            <Form form={form} onSubmit={(values) => mutate(values as AssignFormValues)} readonly={isPending}>
                <Stack sx={{gap: 3, pt: 1}}>
                    <AutocompleteFormItem
                        name={"modelName"}
                        label={t("form.labels.challenge_select")}
                        options={(models ?? []).map(m => m.name ?? "")}
                        getOptionLabel={(m) => m}
                        getOptionValue={(m) => m}
                        rules={{required: t("required_field")}}
                        loading={modelsLoading}
                    />
                    <FormInput name={"instanceName"} rules={{required: t("required_field")}}>
                        <TextField label={t("form.labels.instance_name")} fullWidth={true} type={"text"} required={true}/>
                    </FormInput>
                    <AutocompleteFormItem
                        name={"challengeType"}
                        label={t("form.labels.initial_state")}
                        options={[...ASSIGNABLE_CHALLENGE_STATES]}
                        getOptionLabel={(o) => t(`enums:${o}`)}
                        getOptionValue={(o) => o}
                        rules={{required: t("required_field")}}
                    />
                    <FormInput name={"start"} rules={{required: t("required_field")}}>
                        <TextField label={t("form.labels.start")} fullWidth={true} type={"date"} required={true}
                                   slotProps={{inputLabel: {shrink: true}}}/>
                    </FormInput>
                    <FormInput name={"end"}
                               rules={{
                                   required: t("required_field"),
                                   validate: (v) => {
                                       const start = form.getValues("start")
                                       return !v || !start || new Date(v) > new Date(start)
                                           || t("form.labels.end_before_start")
                                   }
                               }}>
                        <TextField label={t("form.labels.end")} fullWidth={true} type={"date"} required={true}
                                   slotProps={{inputLabel: {shrink: true}}}/>
                    </FormInput>
                    <FormCheckbox name={"hide"} label={t("form.labels.hidden")}/>
                    <Stack direction={"row"} sx={{justifyContent: "flex-end", gap: 2}}>
                        <ButtonIcon icon={<Close/>} variant={"outlined"} onClick={onClose}>{t("buttons:cancel")}</ButtonIcon>
                        <ButtonIcon type={"submit"} icon={<AssignmentTurnedIn/>} variant={"contained"} loading={isPending}>{t("buttons:assign")}</ButtonIcon>
                    </Stack>
                </Stack>
            </Form>
        </DialogContent>
    </Dialog>

}
