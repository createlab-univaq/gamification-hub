import {Button, ButtonGroup, Dialog, Stack, Typography} from "@mui/material";
import {Close} from "@mui/icons-material"
import {useTranslation} from "react-i18next";

interface DeleteDialogProps<T> {
    message: string
    deleteFn: () => void
    element?: T
    setElement: (e: T | undefined) => void
}

export function DeleteDialog<T>({deleteFn, message, element, setElement}: DeleteDialogProps<T>) {

    const {t} = useTranslation()

    if (!element) {
        return <></>
    }

    return <Dialog open={!!element}
                   onClose={() => setElement(undefined)}
    >
        <Stack direction={"row-reverse"}
               sx={{
                   width: "100%",
                   padding: 1
               }}
        >
            <Close sx={{cursor: "pointer"}} onClick={() => setElement(undefined)}/>
        </Stack>
        <Stack sx={{
            padding: 4,
            paddingTop: 0,
            gap: 2,
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Typography variant={"h4"}>{t("delete_title")}</Typography>
            <Typography variant={"body1"}>{message}</Typography>
            <ButtonGroup sx={{justifyContent: "space-between"}}>
                <Button color={"error"} variant={"contained"} onClick={deleteFn}>{t("buttons:confirm")}</Button>
            </ButtonGroup>
        </Stack>
    </Dialog>

}