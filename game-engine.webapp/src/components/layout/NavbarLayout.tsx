import {AppBar, Button, Divider, Stack, Typography} from "@mui/material";

import {AccountCircle, Logout, Menu, Settings} from "@mui/icons-material"
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {PopoverButton} from "../PopoverButton.tsx";
import {ThemeSwitch} from "../ThemeSwitch.tsx";
import {LanguageSelector} from "../LanguageSelector.tsx";
import {useTranslation} from "react-i18next";
import {useSidebarContext} from "../../hooks/use-sidebar-context.ts";
import {AppLogo} from "../logo/AppLogo.tsx";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {AppIcon} from "../logo/AppIcon.tsx";
import {Link} from "react-router-dom";

export function NavbarLayout() {

    const user = getCurrentUser()
    const {setOpen, isOpen} = useSidebarContext()
    const {t} = useTranslation()
    const {width} = useWindowSize()

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
                {width >= 400 &&
                    <>
                        <LanguageSelector defaultLanguage={"en"}/>
                        <ThemeSwitch/>
                    </>
                }
                <PopoverButton id={"account-popover"}
                               buttonLabel={<AccountCircle sx={{fontSize: "2.5rem", cursor: "pointer"}}/>}
                               button={{
                                   variant: "text",
                                   sx: {
                                       width: "fit-content"
                                   }
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
                                           <Typography>{t("welcome", {name: user!.username})}</Typography>
                                       </Stack>
                                       {width < 400 &&
                                           <>
                                               <Stack direction={"row"} sx={{width: "fit-content", px: 2}}>
                                                   <LanguageSelector defaultLanguage={"en"}/>
                                                   <ThemeSwitch/>
                                               </Stack>
                                           </>
                                       }
                                       <Stack divider={<Divider orientation={"horizontal"}/>}>
                                           <Button variant={"text"}
                                                   fullWidth={true}
                                                   href={"/settings"}
                                                   endIcon={<Settings/>}
                                                   sx={{
                                                       borderRadius: 0,
                                                       justifyContent: "space-between"
                                                   }}
                                           >
                                               <Typography>{t("buttons:settings")}</Typography>
                                           </Button>
                                           <Button variant={"contained"}
                                                   color={"error"}
                                                   fullWidth={true}
                                                   endIcon={<Logout/>}
                                                   href={"/logout"}
                                                   sx={{
                                                       borderRadius: 0,
                                                       justifyContent: "space-between"
                                                   }}
                                           >
                                               Logout
                                           </Button>
                                       </Stack>
                                   </Stack>
                               }}
                />
            </Stack>
            <Stack direction={"row"}>
                <Button variant={"text"} onClick={() => setOpen(!isOpen)}><Menu/></Button>
                <Link to={"/dashboard"} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <AppIcon
                        sx={{
                            width: "3.5rem"
                        }}
                    />
                    <AppLogo
                        sx={{
                            width: {
                                lg: "15rem",
                                md: "15rem",
                                sm: "15rem",
                                xs: "0"
                            },
                            height: {
                                lg: "2rem",
                                md: "2rem",
                                sm: "2rem",
                                xs: "0"
                            }
                        }}
                    />
                </Link>
            </Stack>
        </Stack>
    </AppBar>

}