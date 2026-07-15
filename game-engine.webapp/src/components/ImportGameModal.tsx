import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography} from "@mui/material";
import {FileUploader} from "./FileUploader.tsx";
import {useState} from "react";
import type {GamePersistanceDto, ImportGameDto} from "../api/types";
import type {DefaultError} from "@tanstack/react-query";
import {useMutation} from "@tanstack/react-query";
import {gameClient} from "../api";
import {useTranslation} from "react-i18next";

interface ImportGameModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    onSuccess?: (data: GamePersistanceDto[]) => void
    onError?: (error: DefaultError) => void
}

export function ImportGameModal({setOpen, open, onError, onSuccess}: ImportGameModalProps) {

    const [errors, setErrors] = useState<string[]>([])
    const [games, setGames] = useState<ImportGameDto[]>()
    const [t] = useTranslation();
    const {mutate, isPending} = useMutation<GamePersistanceDto[], DefaultError, ImportGameDto[]>({
        mutationKey: ["import-games"],
        mutationFn: (data) => gameClient.importGames(data),
        onError: onError,
        onSuccess: (data) => {
            onSuccess?.(data)
            setOpen(false)
        }
    })

    async function parseJsons(files: FileList) {
        if (!files || !files.length) {
            return undefined
        }
        const jsons: ImportGameDto[] = []
        for (let i = 0; i < files.length; i++) {
            try {
                const parsed = JSON.parse(await files[i].text())
                if (Array.isArray(parsed)) {
                    jsons.push(...parsed)
                } else {
                    jsons.push(parsed)
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setErrors([ t("import.modal.errors")])
            }
        }
        return jsons
    }

    return <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{textAlign: "center"}}>
            {t("import.modal.title")}
        </DialogTitle>
        <DialogContent>
            <Stack direction={"row"}>
                <Stack>
                    {errors.map(error => <Typography variant={"overline"} color={"error"}>{error}</Typography>)}
                    <FileUploader
                        disabled={isPending}
                        onChange={async (files) => {
                            setErrors([])
                            const jsons = await parseJsons(files)
                            setGames(jsons)
                        }}
                        acceptedMimeTypes={[".json"]}
                    />
                </Stack>

            </Stack>
        </DialogContent>
        <DialogActions>
            <Button
                variant={"contained"}
                loading={isPending}
                disabled={isPending}
                onClick={() => {
                    if (games) {
                        mutate(games)
                    }
                }}
            >
                {t("buttons:save")}
            </Button>
        </DialogActions>
    </Dialog>
}