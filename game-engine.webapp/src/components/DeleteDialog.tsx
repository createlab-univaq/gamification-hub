import {Button, ButtonGroup, Dialog, Stack, Typography} from "@mui/material";
import {Close} from "@mui/icons-material"

interface DeleteDialogProps<T> {
    message: string
    deleteFn: () => void
    element?: T
    setElement: (e: T) => void
}

export function DeleteDialog({deleteFn, message, element, setElement}: DeleteDialogProps) {

    if (!element) {
        return <></>
    }

    return <Dialog open={!!element}
                   onClose={() => setElement(undefined)}
    >
        <Stack direction={"row-reverse"}
               sx={{
                   width: "100%",
                   padding:1
               }}
        >
            <Close sx={{cursor:"pointer"}} onClick={()=>setElement(undefined)}/>
        </Stack>
        <Stack sx={{
            padding: 4,
            paddingTop:0,
            gap: 2,
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Typography variant={"h4"}>Sei sicuro?</Typography>
            <Typography variant={"body1"}>{message}</Typography>
            <ButtonGroup direction={"row"} sx={{justifyContent: "space-between"}}>
                <Button color={"error"} variant={"contained"} onClick={deleteFn}>Conferma</Button>
            </ButtonGroup>
        </Stack>
    </Dialog>

}