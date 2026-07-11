import {useForm} from "react-hook-form";
import {useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {teamClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {Button, Stack, TextField, Typography} from "@mui/material";
import type {TeamDto} from "../../api/types";
import {PlayersAutocomplete} from "./PlayersAutocomplete.tsx";
import {useTranslation} from "react-i18next";

interface TeamFormProps {
    gameId: string
    team?: TeamDto
}

type TeamFormValues = {
    id: string
    members: string[]
}

function toFormValues(team?: TeamDto): TeamFormValues {
    return {
        id: team?.id ?? "",
        members: team?.members ?? []
    }
}

export function TeamForm({gameId, team}: TeamFormProps) {

    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const form = useForm<TeamFormValues>({
        defaultValues: toFormValues(team)
    })

    useEffect(() => {
        if (team) {
            form.reset(toFormValues(team))
        }
    }, [team]);

    const {mutate, isPending} = useMutation({
        mutationKey: ["upsert-team", gameId, team?.id],
        mutationFn: (values: TeamFormValues) => {
            const payload: TeamDto = {
                id: values.id,
                members: values.members.filter(Boolean)
            }
            return team?.id
                ? teamClient.updateTeam(gameId, team.id, payload)
                : teamClient.createTeam(gameId, payload)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/teams`, {
                state: {
                    type: "success",
                    title: t("teams.saved.title"),
                    content: t("teams.saved.message", {name: data.name ?? data.id})
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
                 onSubmit={(values) => mutate(values as TeamFormValues)}
                 readonly={isPending}
    >
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"id"}
                rules={{required: t("required_field")}}
            >
                <TextField required={true} type={"text"} fullWidth={true} label={t("teams.form.team_name")}
                           disabled={!!team}/>
            </FormInput>

            <Stack sx={{gap: 1}}>
                <Typography sx={{fontWeight: 600}}>{t("teams.form.members")}</Typography>
                <PlayersAutocomplete name={"members"} gameId={gameId} label={t("teams.form.players")}/>
            </Stack>

            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                <Button href={`/games/${gameId}/teams`} variant={"contained"}>{t("buttons:turn_back")}</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>{t("buttons:save")}</Button>
                    <Button type={"reset"} onClick={() => form.reset(toFormValues(team))}
                            variant={"outlined"}>{t("buttons:reset")}</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
