import {AppBar, Button, Divider, Stack, Typography} from "@mui/material";

import {AccountCircle, Logout, Menu} from "@mui/icons-material"
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {PopoverButton} from "../PopoverButton.tsx";
import {ThemeSwitch} from "../ThemeSwitch.tsx";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {useSidebarContext} from "./SidebarLayout.tsx";
import {LanguageSelector} from "../LanguageSelector.tsx";
import {useTranslation} from "react-i18next";

export function NavbarLayout() {

    const user = getCurrentUser()
    const {width} = useWindowSize()
    const {setOpen, isOpen} = useSidebarContext()
    const {t} = useTranslation()

    return <AppBar
        position="fixed"
        sx={{
            width: "100%",
            padding: "0.5rem",
            zIndex: "6"
        }}
    >
        <Stack direction={"row-reverse"}
               sx={{
                   alignItems: "center",
                   justifyContent: "space-between"
               }}
        >
            <Stack direction={"row"}>
                <LanguageSelector defaultLanguage={"en"}/>
                <ThemeSwitch/>
                <PopoverButton id={"account-popover"}
                               buttonLabel={<AccountCircle sx={{fontSize: "2.5rem", cursor: "pointer"}}/>}
                               button={{
                                   variant: "text",
                                   width: "fit-content"
                               }}
                               popover={{
                                   anchorOrigin: {
                                       horizontal: "left",
                                       vertical: "bottom"
                                   },
                                   transformOrigin: {
                                       horizontal: "center",
                                       vertical: "top"
                                   },
                                   children: <Stack sx={{zIndex: "10"}}>
                                       <Stack sx={{padding: "0.5rem"}}>
                                           <Typography>{t("welcome", {name:user.username})}</Typography>
                                       </Stack>
                                       <Stack divider={<Divider orientation={"horizontal"}/>}>
                                           <Button variant={"contained"}
                                                   color={"error"}
                                                   fullWidth={true}
                                                   href={"/logout"}
                                                   sx={{
                                                       borderRadius: 0,
                                                       justifyContent: "space-between"
                                                   }}
                                           >
                                               Logout
                                               <Logout/>
                                           </Button>
                                       </Stack>
                                   </Stack>
                               }}
                />
            </Stack>
            <Button variant={"text"} onClick={() => setOpen(!isOpen)}><Menu/></Button>
        </Stack>
    </AppBar>

}