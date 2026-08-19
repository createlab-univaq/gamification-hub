import type {ClassificationDto} from "../../api/types";
import {useForm} from "react-hook-form";
import {useEffect} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {classificationClient, pointConceptClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {Stack, TextField} from "@mui/material";
import {ArrowBack, RestartAlt, Save} from "@mui/icons-material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import {useTranslation} from "react-i18next";
import {isCronValid} from "../../utils/cron-utils.ts";
import {CronField} from "../CronField.tsx";

interface ClassificationFormProps {
    gameId: string
    classification?: ClassificationDto
}

type ClassificationFormValues = {
    name: string
    type: "GENERAL" | "INCREMENTAL"
    pointConceptName: string
    itemsToNotificate: number
    cronExpression: string
    periodName: string
}

function toFormValues(c?: ClassificationDto): ClassificationFormValues {
    return {
        name: c?.name ?? "",
        type: c?.type ?? "GENERAL",
        pointConceptName: c?.pointConceptName ?? "",
        itemsToNotificate: c?.itemsToNotificate ?? 0,
        cronExpression: c?.cronExpression ?? "",
        periodName: c?.periodName ?? ""
    }
}

export function ClassificationForm({gameId, classification}: ClassificationFormProps) {

    const [t] = useTranslation()
    const {setNotification} = useNotificationContext()
    const form = useForm<ClassificationFormValues>({
        defaultValues: toFormValues(classification)
    })

    const type = form.watch("type")
    const selectedPointConcept = form.watch("pointConceptName")

    const typeOptions = [
        {value: "GENERAL", label: t("leaderboards.form.type_general")},
        {value: "INCREMENTAL", label: t("leaderboards.form.type_incremental")}
    ]

    const {data: pointConcepts, isLoading: pointConceptsLoading} = useQuery({
        queryKey: ["get-point-concept", gameId],
        queryFn: () => pointConceptClient.getPointConcepts(gameId),
        enabled: !!gameId
    })

    const periods = Object.keys(
        (pointConcepts ?? []).find(pc => pc.name === selectedPointConcept)?.periods ?? {}
    )

    useEffect(() => {
        if (classification) {
            form.reset(toFormValues(classification))
        }
    }, [classification]);

    const {mutate, isPending} = useMutation({
        mutationKey: ["upsert-classification", gameId, classification?.id],
        mutationFn: (values: ClassificationFormValues) => {
            const payload: ClassificationDto = {
                gameId,
                name: values.name,
                type: values.type,
                pointConceptName: values.pointConceptName,
                itemsToNotificate: values.itemsToNotificate,
                cronExpression: values.cronExpression || undefined,
                periodName: values.type === "INCREMENTAL" ? (values.periodName || undefined) : undefined
            }
            return classification?.id
                ? classificationClient.updateClassification(gameId, classification.id, payload)
                : classificationClient.createClassification(gameId, payload)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/classifications`, {
                state: {
                    type: "success",
                    title: t("leaderboards.saved.title"),
                    content: t("leaderboards.saved.content", {name: data.name})
                }
            })
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
        }
    })

    return <Form form={form} onSubmit={(values) => mutate(values as ClassificationFormValues)} readonly={isPending}>
        <Stack sx={{gap: 3}}>
            <FormInput name={"name"} rules={{required: t("required_field")}}>
                <TextField label={t("leaderboards.form.name")}
                           required={true}
                           fullWidth={true}
                           autoFocus={true}
                           type={"text"}
                           disabled={!!classification}/>
            </FormInput>

            <AutocompleteFormItem
                name={"type"}
                label={t("leaderboards.form.type")}
                options={typeOptions}
                getOptionLabel={(o) => o.label}
                getOptionValue={(o) => o.value}
                rules={{required: t("required_field")}}
                disabled={!!classification}
            />

            <AutocompleteFormItem
                name={"pointConceptName"}
                label={t("leaderboards.form.point_concept")}
                options={pointConcepts ?? []}
                getOptionLabel={(pc) => pc.name ?? ""}
                getOptionValue={(pc) => pc.name}
                rules={{required: t("required_field")}}
                loading={pointConceptsLoading}
            />

            <FormInput name={"itemsToNotificate"} rules={{min: 0}}>
                <TextField label={t("leaderboards.form.items_to_notify")} type={"number"} fullWidth={true}
                           slotProps={{htmlInput: {min: 0}}}/>
            </FormInput>

            {type === "GENERAL" &&
                <FormInput name={"cronExpression"} rules={{
                    required: t("required_field"),
                    validate: (value) => isCronValid(value) || t("leaderboards.form.cron_invalid")
                }}>
                    <CronField label={t("leaderboards.form.cron")} required={true}
                               size={"medium"}
                               helperText={t("leaderboards.form.cron_helper")}/>
                </FormInput>
            }

            {type === "INCREMENTAL" &&
                <AutocompleteFormItem
                    name={"periodName"}
                    label={t("leaderboards.form.period")}
                    options={periods}
                    getOptionLabel={(p) => p}
                    getOptionValue={(p) => p}
                    rules={{required: t("leaderboards.form.period_required")}}
                />
            }
            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                <ButtonIcon icon={<ArrowBack/>} href={`/games/${gameId}/classifications`}
                            variant={"contained"}>{t("buttons:turn_back")}</ButtonIcon>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <ButtonIcon type={"submit"} icon={<Save/>} variant={"contained"}>{t("buttons:save")}</ButtonIcon>
                    <ButtonIcon type={"button"} icon={<RestartAlt/>}
                                onClick={() => form.reset(toFormValues(classification))}
                                variant={"outlined"}>{t("buttons:reset")}</ButtonIcon>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
