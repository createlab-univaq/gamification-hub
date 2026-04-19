import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import {ContentCopy, Delete} from "@mui/icons-material"
import {useEffect, useState} from "react";
import type {NotificationType} from "./notification/Notification.tsx";

export type ConsoleMessage = {
    content: string,
    time: Date
    type?: NotificationType | "text"
}

interface MessageConsoleProps {
    messages: ConsoleMessage[],
    onClear?: (errors: string[]) => void
}

export function MessageConsole({messages}: MessageConsoleProps) {

    const [consoleMessages, setConsoleMessages] = useState(messages)

    useEffect(() => {
        setConsoleMessages([...consoleMessages, ...messages])
    }, [messages]);

    return <Stack sx={{height: "100%", width: "100%"}}>
        <Card sx={{backgroundColor: (theme) => theme.palette.background.paper, borderRadius: 0, padding: "0.4rem"}}>
            <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "flex-start"}}>
                <Typography variant={"h6"}>CONSOLE</Typography>
                <Stack direction={"row"} sx={{gap: 1}}>
                    <Button
                        onClick={() => {
                            const logs = consoleMessages.map(m => m.content)
                                .reduce((prev, curr) => `${prev}\n${curr}`)
                            navigator.clipboard.writeText(logs)
                        }}
                        color={"inherit"}
                        variant={"text"}
                        endIcon={<ContentCopy/>}
                    >
                        Copy
                    </Button>
                    <Button
                        onClick={() => {
                            setConsoleMessages([])
                        }}
                        color={"inherit"}
                        variant={"text"}
                        endIcon={<Delete/>}
                    >
                        Clear
                    </Button>
                </Stack>
            </Stack>
        </Card>
        <Card
            component={"pre"}
            sx={{
                height: "100%",
                width: "100%",
                m: 0,
                borderRadius: 0,
                backgroundColor: (theme) => theme.palette.background.default,
            }}>
            <CardContent>
                <Stack direction={"column-reverse"}>
                    {consoleMessages.map((error, index) => {
                        const timestamp = error.time ? `[${error.time.toLocaleTimeString()}]` : ""
                        return <Typography
                            variant={"body1"}
                            color={error.type == "text" ? "textSecondary" : error.type ?? "textSecondary"}
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