import {useFieldArray, useForm} from "react-hook-form";
import {useCallback, useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {badgeClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Add, ArrowBack, Delete, RestartAlt, Save} from "@mui/icons-material";
import {Button, Checkbox, FormControlLabel, IconButton, Stack, TextField, Typography} from "@mui/material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import type {BadgeCollectionDto} from "../../api/types";
import {useTranslation} from "react-i18next";

interface BadgeFormProps {
    gameId: string
    badge?: BadgeCollectionDto
}

type BadgeFormValues = {
    name: string
    hidden: boolean
    badges: { value: string }[]
}

function toFormValues(badge?: BadgeCollectionDto): BadgeFormValues {
    return {
        name: badge?.name ?? "",
        hidden: badge?.hidden ?? false,
        badges: (badge?.badges ?? []).map(value => ({value}))
    }
}

export function BadgeForm({gameId, badge}: BadgeFormProps) {

    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const form = useForm<BadgeFormValues>({
        defaultValues: toFormValues(badge)
    })

    const badges = useFieldArray({control: form.control, name: "badges"})

    const initForm = useCallback((badge?: BadgeCollectionDto) => {
        form.reset(toFormValues(badge))
    }, [form])

    useEffect(() => {
        if (badge) {
            initForm(badge)
        }
    }, [badge, initForm]);

    const {mutate, isPending} = useMutation({
        mutationKey: ["upsert-badge", gameId, badge?.id],
        mutationFn: (values: BadgeFormValues) => {
            const payload: BadgeCollectionDto = {
                name: values.name,
                hidden: values.hidden,
                badges: values.badges.map(b => b.value.trim()).filter(Boolean)
            }
            return badge?.id
                ? badgeClient.updateBadge(gameId, badge.id, payload)
                : badgeClient.addBadge(gameId, payload)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/badges`, {
                state: {
                    type: "success",
                    title: t("badges.saved.title"),
                    content: t("badges.saved.message", {name: data.name})
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
                 onSubmit={(values) => mutate(values as BadgeFormValues)}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"name"}
                rules={{required: t("required_field")}}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={t("badges.form.collection_name")}/>
            </FormInput>

            <FormControlLabel
                control={<Checkbox {...form.register("hidden")} defaultChecked={badge?.hidden ?? false}/>}
                label={t("badges.visibility.hidden")}
            />

            <Stack sx={{gap: 1}}>
                <Typography sx={{fontWeight: 600}}>{t("badges.form.badges_title")}</Typography>
                {badges.fields.map((field, i) => (
                    <Stack key={field.id} direction={"row"} sx={{gap: 1, alignItems: "center"}}>
                        <TextField size={"small"} fullWidth={true} placeholder={t("badges.form.badge_name")}
                                   {...form.register(`badges.${i}.value`)}/>
                        <IconButton size={"small"} color={"error"} onClick={() => badges.remove(i)}>
                            <Delete fontSize={"small"}/>
                        </IconButton>
                    </Stack>
                ))}
                <Button size={"small"} startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                        onClick={() => badges.append({value: ""})}>
                    {t("badges.form.add_badge")}
                </Button>
            </Stack>

            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                <ButtonIcon icon={<ArrowBack/>} href={`/games/${gameId}/badges`} variant={"contained"}>{t("buttons:turn_back")}</ButtonIcon>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <ButtonIcon type={"submit"} icon={<Save/>} variant={"contained"}>{t("buttons:save")}</ButtonIcon>
                    <ButtonIcon type={"button"} icon={<RestartAlt/>} onClick={() => form.reset(toFormValues(badge))}
                            variant={"outlined"}>{t("buttons:reset")}</ButtonIcon>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
