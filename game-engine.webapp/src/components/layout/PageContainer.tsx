import {Stack} from "@mui/material";
import type {PropsWithChildren} from "react";
import {useEffect, useRef} from "react";
import {useLocation} from "react-router-dom";
import {useNotificationContext} from "../../hooks/use-notification-context";

export function PageContainer({children}: PropsWithChildren) {

    const location = useLocation()
    const {setNotification} = useNotificationContext()
    const consumedKey = useRef<string | null>(null)

    useEffect(() => {
        if (location.state && location.state.type && consumedKey.current !== location.key) {
            consumedKey.current = location.key
            setNotification({
                notification: {
                    title: location.state.title ?? "",
                    content: location.state.content ?? "",
                    type: location.state.type
                },
                isSnack: true
            })
            window.history.replaceState({...window.history.state, usr: null}, "")
        }
    }, [location]);

    return <Stack sx={{
        width: "100%",
        padding: 2,
        flex: 1,
        minHeight: 0,
        overflow: "auto",
    }}
    >
        {children}
    </Stack>

}