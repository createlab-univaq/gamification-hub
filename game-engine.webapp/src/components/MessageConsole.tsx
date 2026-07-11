import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import {ContentCopy, Delete} from "@mui/icons-material"
import type {NotificationType} from "./notification/Notification.tsx";
import {useTranslation} from "react-i18next";

export type ConsoleMessageType = NotificationType | "info"

export type ConsoleMessage = {
    content: string,
    time: Date
    type?: ConsoleMessageType
}

interface MessageConsoleProps {
    messages: ConsoleMessage[],
    onClear?: (errors: string[]) => void
}

export function MessageConsole({messages, onClear}: MessageConsoleProps) {

    const [t] = useTranslation()

    return <Stack sx={{height: "100%", width: "100%", overflow: "hidden"}}>
        <Card sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: 0,
            padding: "0.4rem",
            flexShrink: 0
        }}>
            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "flex-start"}}>
                <Typography variant={"h6"}>CONSOLE</Typography>
                <Stack direction={"row"} sx={{gap: 1}}>
                    <Button
                        onClick={() => {
                            const logs = messages.map(m => m.content)
                                .reduce((prev, curr) => `${prev}\n${curr}`)
                            navigator.clipboard.writeText(logs)
                        }}
                        color={"inherit"}
                        variant={"text"}
                        endIcon={<ContentCopy/>}
                    >
                        {t("buttons:copy")}
                    </Button>
                    <Button
                        onClick={() => {
                            onClear?.(messages.map(m => m.content))
                        }}
                        color={"inherit"}
                        variant={"text"}
                        endIcon={<Delete/>}
                    >
                        {t("buttons:clear")}
                    </Button>
                </Stack>
            </Stack>
        </Card>
        <Card
            component={"pre"}
            sx={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                m: 0,
                borderRadius: 0,
                backgroundColor: (theme) => theme.palette.background.default,
                overflow: "auto",
            }}>
            <CardContent>
                <Stack direction={"column-reverse"}>
                    {messages.map((error, index) => {
                        const timestamp = error.time ? `[${error.time.toLocaleTimeString()}]` : ""
                        return <Typography
                            variant={"body1"}
                            color={error.type == "info" ? "textSecondary" : error.type ?? "textSecondary"}
                            key={`console-error-${index}`}
                        >
                            {timestamp} {error.content}
                        </Typography>
                    })}
                </Stack>
            </CardContent>
        </Card>
    </Stack>
}