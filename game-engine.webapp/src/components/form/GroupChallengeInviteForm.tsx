import {useForm} from "react-hook-form";
import {useMutation, useQuery} from "@tanstack/react-query";
import {groupChallengeClient, playerClient, pointConceptClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {Button, Dialog, DialogContent, DialogTitle, Divider, Stack, TextField, Typography} from "@mui/material";
import type {ChallengeInvitationDto, GroupChallengeDto} from "../../api/types";

interface GroupChallengeInviteFormProps {
    gameId: string
    playerId: string
    open: boolean
    onClose: () => void
}

type InviteFormValues = {
    guestIds: string[]
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
    const form = useForm<InviteFormValues>({
        defaultValues: {
            guestIds: [], challengeModelName: "", challengeStart: "", challengeEnd: "",
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
                    title: "Invito creato",
                    content: "L'invito alla sfida di gruppo è stato creato"
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
        <DialogTitle>Invita a una sfida di gruppo</DialogTitle>
        <DialogContent>
            <Form form={form} onSubmit={(values) => mutate(values as InviteFormValues)} readonly={isPending}>
                <Stack sx={{gap: 3, pt: 1}}>
                    <AutocompleteFormItem
                        name={"guestIds"}
                        label={"Ospiti"}
                        multiple={true}
                        options={guestOptions}
                        getOptionLabel={(p) => p}
                        getOptionValue={(p) => p}
                        loading={playersLoading}
                        rules={{validate: (v) => (Array.isArray(v) && v.length > 0) || "Seleziona almeno un ospite"}}
                    />
                    <FormInput name={"challengeModelName"} rules={{required: "Campo obbligatorio"}}>
                        <TextField label={"Modello sfida di gruppo"} fullWidth={true} type={"text"} required={true}/>
                    </FormInput>
                    <AutocompleteFormItem
                        name={"pointConceptName"}
                        label={"Punteggio"}
                        options={pointConcepts ?? []}
                        getOptionLabel={(pc) => pc.name ?? ""}
                        getOptionValue={(pc) => pc.name}
                        loading={pointConceptsLoading}
                        rules={{required: "Campo obbligatorio"}}
                    />
                    <AutocompleteFormItem
                        name={"periodName"}
                        label={"Periodo"}
                        options={periods}
                        getOptionLabel={(p) => p}
                        getOptionValue={(p) => p}
                    />
                    <FormInput name={"challengeTarget"} rules={{min: 0}}>
                        <TextField label={"Obiettivo"} fullWidth={true} type={"number"}
                                   slotProps={{htmlInput: {min: 0, step: "any"}}}/>
                    </FormInput>
                    <Stack direction={"row"} sx={{gap: 2}}>
                        <FormInput name={"challengeStart"}>
                            <TextField label={"Inizio"} fullWidth={true} type={"datetime-local"}
                                       slotProps={{inputLabel: {shrink: true}}}/>
                        </FormInput>
                        <FormInput name={"challengeEnd"}>
                            <TextField label={"Fine"} fullWidth={true} type={"datetime-local"}
                                       slotProps={{inputLabel: {shrink: true}}}/>
                        </FormInput>
                    </Stack>

                    <Divider/>
                    <Typography variant={"subtitle2"} sx={{fontWeight: 600}}>Ricompensa</Typography>
                    <Stack direction={"row"} sx={{gap: 2}}>
                        <FormInput name={"percentage"} rules={{min: 0}}>
                            <TextField label={"Percentuale"} fullWidth={true} type={"number"}
                                       slotProps={{htmlInput: {min: 0, step: "any"}}}/>
                        </FormInput>
                        <FormInput name={"threshold"} rules={{min: 0}}>
                            <TextField label={"Soglia"} fullWidth={true} type={"number"}
                                       slotProps={{htmlInput: {min: 0, step: "any"}}}/>
                        </FormInput>
                    </Stack>

                    <Stack direction={"row"} sx={{justifyContent: "flex-end", gap: 2}}>
                        <Button variant={"outlined"} onClick={onClose}>Annulla</Button>
                        <Button type={"submit"} variant={"contained"} loading={isPending}>Invita</Button>
                    </Stack>
                </Stack>
            </Form>
        </DialogContent>
    </Dialog>

}
