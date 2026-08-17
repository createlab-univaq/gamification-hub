import type {GameDto} from "../../api/types";
import type {FieldValues} from "react-hook-form";
import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {gameClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useEffect} from "react";
import {Form} from "./Form.tsx";
import {Stack, TextField} from "@mui/material";
import {ArrowBack, RestartAlt, Save} from "@mui/icons-material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import {FormInput} from "./FormInput.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {GAME_STORAGE_KEY} from "../../utils/storage-utils.ts";
import {FormCheckbox} from "./FormCheckbox.tsx";
import {useTranslation} from "react-i18next";
import {gameQueryKey} from "../GameContext.tsx";

export interface GameFormProps {
    game?: GameDto
}

export function GameForm({game}: GameFormProps) {

    const form = useForm<GameDto>({
        defaultValues: {
            name: "",
            domain: "",
            terminated: false
        }
    })
    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()

    const {mutate, isPending} = useMutation<GameDto, Error, GameDto>({
        mutationFn: (request) => {
            if (game) {
                return gameClient.updateGame(game.id!, request)
            }
            return gameClient.addGame({
                ...request,
                concepts: [],
                tasks: []
            } satisfies GameDto)
        },
        onSuccess: (data) => {
            // Remove cached game
            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({}))
            queryClient.invalidateQueries({queryKey: gameQueryKey(data.id)})
            navigateTo(game ? `/games/${data.id}` : "/dashboard", {
                state: {
                    type: "success",
                    title: t("game.saved.title"),
                    content: t("game.saved.message", {name: data.name})
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

    const initForm = (game?: GameDto) => {
        form.reset({
            ...(game ?? {})
        })
    }

    function handleSubmit(fieldValues: FieldValues) {
        mutate(fieldValues)
    }

    useEffect(() => {
        if (game) {
            initForm(game)
        }
    }, [game]);

    return <Form form={form} onSubmit={handleSubmit} readonly={isPending}>
        <Stack sx={{gap: 3}}>
            <Stack sx={{gap: 2}}>
                <FormInput name={"name"}
                           rules={{
                               required: t("required_field")
                           }}
                >
                    <TextField type={"text"} label={t("name")} placeholder={"Half life 3"} fullWidth={true} autoFocus={true}/>
                </FormInput>
                <FormInput name={"domain"}
                           rules={{
                               required: t("required_field")
                           }}
                >
                    <TextField type={"text"} label={t("game.domain")} placeholder={"ilmiodominio.com"}
                               fullWidth={true}/>
                </FormInput>
                {!!game && <FormCheckbox name={"terminated"} defaultValue={true} label={t("game.terminated_label")}/>}
            </Stack>
            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <ButtonIcon icon={<ArrowBack/>} href={game ? `/games/${game.id}`: "/dashboard"} variant={"contained"}>{t("buttons:turn_back")}</ButtonIcon>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <ButtonIcon type={"submit"} icon={<Save/>} variant={"contained"}>{t("buttons:save")}</ButtonIcon>
                    <ButtonIcon type={"button"} icon={<RestartAlt/>} onClick={() => initForm(game)}
                            variant={"outlined"}>{t("buttons:reset")}</ButtonIcon>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
