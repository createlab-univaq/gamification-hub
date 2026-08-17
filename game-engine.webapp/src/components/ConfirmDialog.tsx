import {Button, Dialog, Stack, Typography} from "@mui/material";
import {Close} from "@mui/icons-material"
import {useTranslation} from "react-i18next";

interface ConfirmDialogProps {
    message: string
    onConfirm: () => void
    open: boolean
    setOpen: (open: boolean) => void
}

export function ConfirmDialog({onConfirm, message, open, setOpen}: ConfirmDialogProps) {

    const {t} = useTranslation()

    if (!open) {
        return <></>
    }

    return <Dialog open={open}
                   onClose={() => setOpen(false)}
    >
        <Stack direction={"row-reverse"}
               sx={{
                   width: "100%",
                   padding: 1
               }}
        >
            <Close sx={{cursor: "pointer"}} onClick={() => setOpen(false)}/>
        </Stack>
        <Stack sx={{
            padding: 4,
            paddingTop: 0,
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
        }}>
            <Typography variant={"h4"}>{t("delete_title")}</Typography>
            <Typography variant={"body1"}>{message}</Typography>
            <Stack direction={"row"} sx={{gap: 2, justifyContent: "center"}}>
                <Button variant={"outlined"} onClick={() => setOpen(false)}>{t("buttons:cancel")}</Button>
                <Button variant={"contained"} onClick={onConfirm}>{t("buttons:confirm")}</Button>
            </Stack>
        </Stack>
    </Dialog>

}