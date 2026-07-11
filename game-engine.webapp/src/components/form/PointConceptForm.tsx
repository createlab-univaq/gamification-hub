import type {PeriodDto, PointConceptDto} from "../../api/types";
import {useNotificationContext} from "../../hooks/use-notification-context";
import type {FieldValues} from "react-hook-form";
import {useFieldArray, useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {pointConceptClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useEffect} from "react";
import {Form} from "./Form.tsx";
import {Button, Card, CardContent, Divider, IconButton, Stack, TextField, Typography} from "@mui/material";
import {Add, Delete} from "@mui/icons-material";
import {FormInput} from "./FormInput.tsx";
import {useTranslation} from "react-i18next";

interface PointConceptFormProps {
    gameId: string,
    pointConcept?: PointConceptDto
}

type PeriodRow = {
    identifier: string
    start: string
    end: string
    periodDays: number
    capacity: number
}
type PointConceptFormValues = {
    name: string
    score: number
    periods: PeriodRow[]
}

const DAY_MS = 24 * 3600 * 1000

const toDateInput = (millis?: number) => millis ? new Date(millis).toISOString().slice(0, 10) : ""
const fromDateInput = (value: string) => value ? new Date(value).getTime() : undefined

export function PointConceptForm({pointConcept, gameId}: PointConceptFormProps) {
    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const form = useForm<PointConceptFormValues>({
        defaultValues: {
            name: "",
            score: 0.0,
            periods: []
        }
    })
    const periods = useFieldArray({control: form.control, name: "periods"})

    const {mutate, isPending} = useMutation<PointConceptDto, Error, { gameId: string, pc: PointConceptDto }>({
        mutationKey: ["upsert-pc", gameId, pointConcept],
        mutationFn: ({gameId, pc}) => {
            if (pointConcept) {
                pc.id = pointConcept.id
                return pointConceptClient.updatePointConcept(gameId, pc)
            }
            return pointConceptClient.addPointConcept(gameId, pc)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/points`, {
                state: {
                    type: "success",
                    title: t("points.saved.title"),
                    content: t("points.saved.message", {name: data.name})
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

    function initForm(pc?: PointConceptDto) {
        form.reset({
            name: pc?.name ?? "",
            score: pc?.score ?? 0,
            periods: Object.entries(pc?.periods ?? {}).map(([key, p]) => ({
                identifier: p.identifier ?? key,
                start: toDateInput(p.start),
                end: toDateInput(p.end),
                periodDays: p.period ? p.period / DAY_MS : 0,
                capacity: p.capacity ?? 0
            }))
        })
    }

    function handleSubmit(values: FieldValues) {
        const periodMap: Record<string, PeriodDto> = {}
        values.periods.forEach((row: PeriodRow) => {
            if (!row.identifier) return
            periodMap[row.identifier] = {
                identifier: row.identifier,
                start: fromDateInput(row.start),
                end: fromDateInput(row.end),
                period: row.periodDays ? row.periodDays * DAY_MS : undefined,
                capacity: row.capacity
            }
        })
        const pc: PointConceptDto = {
            name: values.name,
            score: values.score,
            periods: periodMap
        }
        mutate({gameId: gameId, pc: pc})
    }

    useEffect(() => {
        if (pointConcept) {
            initForm(pointConcept)
        }
    }, [pointConcept]);

    return <Form form={form}
                 onSubmit={handleSubmit}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <Stack sx={{gap: 2}}>
                <FormInput
                    name={"name"}
                    rules={{
                        required: t("required_field")
                    }}
                >
                    <TextField required={true} type={"text"} fullWidth={true} label={t("name")}/>
                </FormInput>
            </Stack>
            <Stack sx={{gap: 1}}>
                <Divider/>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>{t("points.form.periods_title")}</Typography>
                <Typography variant={"caption"} color={"text.secondary"}>
                    {t("points.form.periods_hint")}
                </Typography>
                {periods.fields.map((field, i) => (
                    <Card key={field.id} variant={"outlined"}>
                        <CardContent>
                            <Stack sx={{gap: 1, alignItems: "flex-start"}}>
                                <FormInput
                                    name={`periods.${i}.identifier`}
                                    rules={{
                                        required: t("required_field")
                                    }}
                                >
                                    <TextField label={t("points.form.period_name")} fullWidth={true} required={true}/>
                                </FormInput>
                                <Stack direction={"row"} sx={{gap: 2, width: "100%"}}>
                                    <FormInput name={`periods.${i}.start`}>
                                        <TextField label={t("points.form.start")} type={"date"}
                                                   fullWidth={true}
                                                   slotProps={{inputLabel: {shrink: true}}}/>
                                    </FormInput>
                                    <FormInput name={`periods.${i}.end`}>
                                        <TextField label={t("points.form.end")} type={"date"}
                                                   fullWidth={true}
                                                   slotProps={{inputLabel: {shrink: true}}}/>
                                    </FormInput>
                                </Stack>
                                <Stack direction={"row"} sx={{gap: 2, width: "100%"}}>
                                    <FormInput
                                        name={`periods.${i}.periodDays`}
                                        rules={{min: 0}}
                                    >
                                        <TextField label={t("points.form.period_days")} type={"number"}
                                                   fullWidth={true}
                                                   slotProps={{htmlInput: {min: 0}}}/>
                                    </FormInput>
                                    <FormInput
                                        name={`periods.${i}.capacity`}
                                        rules={{min: 0}}
                                    >
                                        <TextField label={t("points.form.capacity")} type={"number"}
                                                   fullWidth={true}
                                                   slotProps={{htmlInput: {min: 0}}}/>
                                    </FormInput>
                                </Stack>
                                <IconButton color={"error"} onClick={() => periods.remove(i)}>
                                    <Delete/>
                                </IconButton>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
                <Button size={"small"} startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                        onClick={() => periods.append({
                            identifier: "",
                            start: "",
                            end: "",
                            periodDays: 0,
                            capacity: 0
                        })}>
                    {t("points.form.add_period")}
                </Button>
            </Stack>

            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={`/games/${gameId}/points`} variant={"contained"}>{t("buttons:turn_back")}</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>{t("buttons:save")}</Button>
                    <Button type={"reset"} onClick={() => initForm(pointConcept)} variant={"outlined"}>{t("buttons:reset")}</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
