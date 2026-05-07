import {Box, Stack, Toolbar} from "@mui/material";
import {NavbarLayout} from "./NavbarLayout.tsx";
import {SidebarContextProvider, SidebarLayout} from "./SidebarLayout.tsx";
import {Outlet} from "react-router-dom";

export function AppLayout() {

    return <SidebarContextProvider defaultOpen={false}>
        <Box sx={{display: 'flex'}}>
            <SidebarLayout/>
            <Stack
                component="main"
                sx={{
                    width: "100%",
                    minWidth: 0,
                    overflow: "hidden",
                }}
            >
                <NavbarLayout/>
                <Toolbar/>
                <Outlet/>
            </Stack>
        </Box>
    </SidebarContextProvider>
}