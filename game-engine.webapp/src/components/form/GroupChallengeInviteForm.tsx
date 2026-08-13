import {useForm} from "react-hook-form";
import {useMutation, useQuery} from "@tanstack/react-query";
import {groupChallengeClient, playerClient, pointConceptClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {Dialog, DialogContent, DialogTitle, Divider, Stack, TextField, Typography} from "@mui/material";
import {Close, GroupAdd} from "@mui/icons-material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import type {ChallengeInvitationDto, GroupChallengeDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {GROUP_CHALLENGE_MODELS} from "../../utils/enum-utils.ts";

interface GroupChallengeInviteFormProps {
    gameId: string
    playerId: string
    open: boolean
    onClose: () => void
}

type InviteFormValues = {
    guestIds: string[]
    challengeName: string
    challengeModelName: string
    challengeStart: string
    challengeEnd: string
    challengeTarget: number
    pointConceptName: string
    periodName: string
    percentage: number
    threshold: number
}

function toIso(value: string): string | undefined {
    return value ? new Date(value).toISOString() : undefined
}

export function GroupChallengeInviteForm({gameId, playerId, open, onClose}: GroupChallengeInviteFormProps) {

    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const form = useForm<InviteFormValues>({
        defaultValues: {
            guestIds: [], challengeName: "", challengeModelName: "", challengeStart: "", challengeEnd: "",
            challengeTarget: 0, pointConceptName: "", periodName: "", percentage: 0, threshold: 0
        }
    })

    const selectedPointConcept = form.watch("pointConceptName")

    const {data: players, isLoading: playersLoading} = useQuery({
        queryKey: ["get-players", gameId],
        queryFn: () => playerClient.getPlayers(gameId),
        enabled: !!gameId && open
    })

    const {data: pointConcepts, isLoading: pointConceptsLoading} = useQuery({
        queryKey: ["get-point-concept", gameId],
        queryFn: () => pointConceptClient.getPointConcepts(gameId),
        enabled: !!gameId && open
    })

    const guestOptions = (players?.content ?? [])
        .map(p => p.playerId ?? "")
        .filter(id => id && id !== playerId)

    const periods = Object.keys(
        (pointConcepts ?? []).find(pc => pc.name === selectedPointConcept)?.periods ?? {}
    )

    const {mutate, isPending} = useMutation<GroupChallengeDto, Error, InviteFormValues>({
        mutationKey: ["invite-group-challenge", gameId, playerId],
        mutationFn: (values: InviteFormValues) => {
            const payload: ChallengeInvitationDto = {
                guestIds: values.guestIds,
                challengeName: values.challengeName,
                challengeModelName: values.challengeModelName,
                challengeStart: toIso(values.challengeStart),
                challengeEnd: toIso(values.challengeEnd),
                challengeTarget: Number(values.challengeTarget),
                pointConceptName: values.pointConceptName,
                periodName: values.periodName || undefined,
                reward: {
                    percentage: Number(values.percentage),
                    threshold: Number(values.threshold),
                    calculationPointConceptName: values.pointConceptName,
                    calculationPeriodName: values.periodName || undefined,
                    targetPointConceptName: values.pointConceptName,
                    targetPeriodName: values.periodName || undefined
                }
            }
            return groupChallengeClient.invite(gameId, playerId, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-player", gameId, playerId]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("players.groups.challenges.invites.created.title"),
                    content: t("players.groups.challenges.invites.created.message")
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
        <DialogTitle>{t("players.groups.challenges.invite_form.title")}</DialogTitle>
        <DialogContent>
            <Form form={form} onSubmit={(values) => mutate(values as InviteFormValues)} readonly={isPending}>
                <Stack sx={{gap: 3, pt: 1}}>
                    <AutocompleteFormItem
                        name={"guestIds"}
                        label={t("players.groups.challenges.invite_form.guests")}
                        multiple={true}
                        options={guestOptions}
                        getOptionLabel={(p) => p}
                        getOptionValue={(p) => p}
                        loading={playersLoading}
                        rules={{validate: (v) => (Array.isArray(v) && v.length > 0) || t("players.groups.challenges.invite_form.guest_required")}}
                    />
                    <FormInput name={"challengeName"} rules={{required: t("required_field")}}>
                        <TextField label={t("players.groups.challenges.invite_form.name")} fullWidth={true} type={"text"} required={true}
                                   placeholder={t("players.groups.challenges.invite_form.name_placeholder")}/>
                    </FormInput>
                    <AutocompleteFormItem
                        name={"challengeModelName"}
                        label={t("players.groups.challenges.invite_form.model_name")}
                        options={[...GROUP_CHALLENGE_MODELS]}
                        getOptionLabel={(m) => t(`enums:${m}`)}
                        getOptionValue={(m) => m}
                        required={true}
                        rules={{required: t("required_field")}}
                    />
                    <AutocompleteFormItem
                        name={"pointConceptName"}
                        label={t("players.groups.challenges.invite_form.point_concept")}
                        options={pointConcepts ?? []}
                        getOptionLabel={(pc) => pc.name ?? ""}
                        getOptionValue={(pc) => pc.name}
                        loading={pointConceptsLoading}
                        rules={{required: t("required_field")}}
                    />
                    <AutocompleteFormItem
                        name={"periodName"}
                        label={t("players.groups.challenges.invite_form.period")}
                        options={periods}
                        getOptionLabel={(p) => p}
                        getOptionValue={(p) => p}
                    />
                    <FormInput name={"challengeTarget"}
                               rules={{
                                   required: t("required_field"),
                                   validate: (v) => Number(v) > 0 || t("players.groups.challenges.invite_form.target_positive")
                               }}>
                        <TextField label={t("players.groups.challenges.invite_form.target")} fullWidth={true} type={"number"}
                                   required={true}
                                   slotProps={{htmlInput: {min: 0, step: "any"}}}/>
                    </FormInput>
                    <Stack direction={"row"} sx={{gap: 2}}>
                        <FormInput name={"challengeStart"}>
                            <TextField label={t("players.groups.challenges.invite_form.start")} fullWidth={true} type={"datetime-local"}
                                       slotProps={{inputLabel: {shrink: true}}}/>
                        </FormInput>
                        <FormInput name={"challengeEnd"}
                                   rules={{
                                       validate: (v) => {
                                           const start = form.getValues("challengeStart")
                                           return !v || !start || new Date(v) > new Date(start)
                                               || t("players.groups.challenges.invite_form.end_before_start")
                                       }
                                   }}>
                            <TextField label={t("players.groups.challenges.invite_form.end")} fullWidth={true} type={"datetime-local"}
                                       slotProps={{inputLabel: {shrink: true}}}/>
                        </FormInput>
                    </Stack>

                    <Divider/>
                    <Typography variant={"subtitle2"} sx={{fontWeight: 600}}>{t("players.groups.challenges.invite_form.reward")}</Typography>
                    <Stack direction={"row"} sx={{gap: 2}}>
                        <FormInput name={"percentage"} rules={{min: 0}}>
                            <TextField label={t("players.groups.challenges.invite_form.percentage")} fullWidth={true} type={"number"}
                                       slotProps={{htmlInput: {min: 0, step: "any"}}}/>
                        </FormInput>
                        <FormInput name={"threshold"} rules={{min: 0}}>
                            <TextField label={t("players.groups.challenges.invite_form.threshold")} fullWidth={true} type={"number"}
                                       slotProps={{htmlInput: {min: 0, step: "any"}}}/>
                        </FormInput>
                    </Stack>

                    <Stack direction={"row"} sx={{justifyContent: "flex-end", gap: 2}}>
                        <ButtonIcon icon={<Close/>} variant={"outlined"} onClick={onClose}>{t("buttons:cancel")}</ButtonIcon>
                        <ButtonIcon type={"submit"} icon={<GroupAdd/>} variant={"contained"} loading={isPending}>{t("buttons:invite")}</ButtonIcon>
                    </Stack>
                </Stack>
            </Form>
        </DialogContent>
    </Dialog>

}
