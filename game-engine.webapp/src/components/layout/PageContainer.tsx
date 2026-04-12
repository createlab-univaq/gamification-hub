import {Backdrop, Paper, Stack} from "@mui/material";
import type {PropsWithChildren} from "react";
import {useLocation} from "react-router-dom";
import {useEffect} from "react";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";

export function PageContainer({children}: PropsWithChildren) {

    const location = useLocation()
    const {setNotification} = useNotificationContext()

    useEffect(() => {
        if(location.state && location.state.type) {
            setNotification({
                notification:{
                    title:location.state.title ?? "",
                    content: location.state.content ?? "",
                    type: location.state.type
                },
                isSnack: true
            })
            navigateTo(location.pathname, {replace:true, state:null})
        }
    }, [location]);

    return <Stack sx={{
        width: "100%",
        padding: 2,
        overflow: "auto",
    }}
    >
        {children}
    </Stack>

}