import type {ReactNode} from "react";
import type {SlideProps, SxProps, Theme} from '@mui/material';
import {Card, CardContent, Dialog, DialogContent, DialogTitle, Slide, Snackbar, Stack, Typography} from "@mui/material";

import {DoneAll, Error, ReportProblem, Warning} from '@mui/icons-material'


export type NotificationType = "error" | "warning" | "success"

interface NotificationProps {
    title: ReactNode
    message: ReactNode,
    type: NotificationType
    isOpen: boolean
    setOpen: (isOpen: boolean) => void
}

interface NotificationIconProps {
    type: NotificationType
    sx?: SxProps
}

const FullscreenNotificationGradients = {
    error: (theme: Theme) => `linear-gradient(to top, ${theme.palette.background.paper}, ${theme.palette.error.main})`,
    success: (theme: Theme) => `linear-gradient(to top, ${theme.palette.background.paper}, ${theme.palette.success.main})`,
    warning: (theme: Theme) => `linear-gradient(to top, ${theme.palette.background.paper}, ${theme.palette.warning.main})`
} satisfies Record<NotificationType, (theme: Theme) => string>

const PopupNotificationGradients = {
    error: (theme: Theme) => `linear-gradient(to bottom, ${theme.palette.error.light} 0rem, ${theme.palette.background.paper} 2rem, ${theme.palette.background.paper}) 100%`,
    success: (theme: Theme) => `linear-gradient(to bottom, ${theme.palette.success.main} 0rem, ${theme.palette.background.paper} 2rem, ${theme.palette.background.paper}) 100%`,
    warning: (theme: Theme) => `linear-gradient(to bottom, ${theme.palette.warning.main} 0rem, ${theme.palette.background.paper} 2rem, ${theme.palette.background.paper}) 100%`
} satisfies Record<NotificationType, (theme: Theme) => string>


function NotificationIcon({type, sx}: NotificationIconProps) {
    switch (type) {
        case "success":
            return <DoneAll sx={{...sx, color: (theme) => theme.palette.success.dark}}/>
        case "error":
            return <Error sx={{...sx, color: (theme) => theme.palette.error.main}}/>
        case "warning":
            return <Warning sx={{...sx, color: (theme) => theme.palette.warning.main}}/>
        default:
            return <ReportProblem/>
    }
}


export function FullScreenNotification({message, title, type, isOpen, setOpen}: NotificationProps) {
    return <Dialog open={isOpen}
                   onClose={() => setOpen(false)}
    >
        <DialogTitle
            sx={{
                background: FullscreenNotificationGradients[type]
            }}>
            <Stack sx={{
                alignItems: "center"
            }}>
                <Typography variant={"h3"}>{title}</Typography>
            </Stack>
        </DialogTitle>
        <DialogContent>
            {message}
        </DialogContent>
    </Dialog>
}

export function PopupNotification({message, title, type, isOpen, setOpen}: NotificationProps) {

    function SlideTransition(props: SlideProps) {
        return <Slide {...props} direction="down"/>;
    }

    return <Snackbar open={isOpen}
                     key={isOpen ? "popup-open" : "popup-closed"}
                     autoHideDuration={3000}
                     onClose={() => setOpen(false)}
                     anchorOrigin={{vertical: "top", horizontal: "center"}}
                     slots={{
                         transition: SlideTransition
                     }}
    >
        <Card sx={{
            px: "2rem",
            background: PopupNotificationGradients[type]
        }}>
            <Stack direction={"row"} sx={{
                py: "0.5rem",
                justifyContent: "center",
                gap: "0.5rem"
            }}>
                <NotificationIcon type={type} sx={{fontSize: "2rem"}}/>
                <Typography variant={"h5"}>{title}</Typography>
            </Stack>
            <CardContent>
                {message}
            </CardContent>
        </Card>
    </Snackbar>

}