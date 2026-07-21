import {useForm} from "react-hook-form";
import {useMutation, useQuery} from "@tanstack/react-query";
import {playerBlackListClient, playerClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {Form} from "./Form.tsx";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {Dialog, DialogContent, DialogTitle, Stack} from "@mui/material";
import {Block, Close} from "@mui/icons-material";
import {ButtonIcon} from "../ButtonIcon.tsx";
import type {PlayerBlackListDto} from "../../api/types";
import {useTranslation} from "react-i18next";

interface BlockPlayerFormProps {
    gameId: string
    playerId: string
    excludedIds: string[]
    open: boolean
    onClose: () => void
}

type BlockPlayerFormValues = {
    otherPlayerId: string
}

export function BlockPlayerForm({gameId, playerId, excludedIds, open, onClose}: BlockPlayerFormProps) {

    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const form = useForm<BlockPlayerFormValues>({
        defaultValues: {otherPlayerId: ""}
    })

    const {data: players, isLoading: playersLoading} = useQuery({
        queryKey: ["get-players", gameId],
        queryFn: () => playerClient.getPlayers(gameId),
        enabled: !!gameId && open
    })

    const guestOptions = (players?.content ?? [])
        .map(p => p.playerId ?? "")
        .filter(id => id && !excludedIds.includes(id))

    const {mutate, isPending} = useMutation<PlayerBlackListDto, Error, BlockPlayerFormValues>({
        mutationKey: ["block-player", gameId, playerId],
        mutationFn: (values: BlockPlayerFormValues) => playerBlackListClient.blockPlayer(gameId, playerId, values.otherPlayerId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-blacklist", gameId, playerId]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("players.blacklist.blocked.title"),
                    content: t("players.blacklist.blocked.message")
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
        <DialogTitle>{t("players.blacklist.block_form.title")}</DialogTitle>
        <DialogContent>
            <Form form={form} onSubmit={(values) => mutate(values as BlockPlayerFormValues)} readonly={isPending}>
                <Stack sx={{gap: 3, pt: 1}}>
                    <AutocompleteFormItem
                        name={"otherPlayerId"}
                        label={t("players.blacklist.block_form.player")}
                        options={guestOptions}
                        getOptionLabel={(p) => p}
                        getOptionValue={(p) => p}
                        loading={playersLoading}
                        rules={{required: t("required_field")}}
                    />
                    <Stack direction={"row"} sx={{justifyContent: "flex-end", gap: 2}}>
                        <ButtonIcon icon={<Close/>} variant={"outlined"} onClick={onClose}>{t("buttons:cancel")}</ButtonIcon>
                        <ButtonIcon type={"submit"} icon={<Block/>} variant={"contained"} loading={isPending}>{t("buttons:block")}</ButtonIcon>
                    </Stack>
                </Stack>
            </Form>
        </DialogContent>
    </Dialog>

}
