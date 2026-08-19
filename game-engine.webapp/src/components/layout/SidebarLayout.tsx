import {type PropsWithChildren, useMemo, useState} from "react";
import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, Stack, Toolbar, Typography} from "@mui/material";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {getSidebarItems} from "./sidebarItems.ts";
import {Link, useLocation} from "react-router-dom";
import {SIDEBAR_OPEN_KEY} from "../../utils/storage-utils.ts";
import {getBaseGamePath} from "../../utils/navigation-utils.ts";
import {useTranslation} from "react-i18next";
import {UseSidebarContext, useSidebarContext} from "../../hooks/use-sidebar-context.ts";
import {AppLogo} from "../logo/AppLogo.tsx";
import {AppIcon} from "../logo/AppIcon.tsx";
import {ButtonIcon} from "../ButtonIcon.tsx";
import { Close } from "@mui/icons-material";


export function SidebarContextProvider({defaultOpen, children}: PropsWithChildren<{ defaultOpen: boolean }>) {

    const isSidebarOpen = localStorage.getItem(SIDEBAR_OPEN_KEY) === "true"
    const [isOpen, setOpen] = useState(isSidebarOpen ?? defaultOpen)

    const updateSideBarState = (open: boolean) => {
        setOpen(open)
        localStorage.setItem(SIDEBAR_OPEN_KEY, `${open}`)
    }

    return <UseSidebarContext value={{isOpen, setOpen: updateSideBarState}}>
        {children}
    </UseSidebarContext>
}

export function SidebarLayout() {

    const {isOpen, setOpen} = useSidebarContext()
    const {width} = useWindowSize()
    const location = useLocation()
    const {t} = useTranslation()

    const sidebarWidth = useMemo(() => {
        if (width < 800) {
            if (isOpen) {
                return "100%"
            }
            return "40%"
        }
        if (isOpen) {
            return "15%"
        }
        return "4rem"
    }, [isOpen, width])

    return <Drawer
        variant={width < 800 ? "temporary" : "permanent"}
        ModalProps={{
            keepMounted: false,
        }}
        open={isOpen}
        onClose={() => setOpen(!isOpen)}
        sx={{
            flexShrink: 0,
            width: sidebarWidth,
            [`& .MuiDrawer-paper`]: {
                zIndex: "5",
                width: sidebarWidth,
                boxSizing: 'border-box',
                transition: "width ease-in-out 0.125s",
            }
        }}
    >
        {width >= 800 && <Toolbar/>}
        <Box sx={{overflowX: "hidden", overflowY: "hidden"}}>
            {width < 800 &&
                <Stack direction={"row"} sx={{px: 1, py:0.5}}>
                    <Link to={"/dashboard"} style={{display: "flex", alignItems: "center"}}>
                        <AppIcon
                            sx={{
                                width: "3rem"
                            }}
                        />
                        <AppLogo
                            sx={{
                                width: "75%",
                                height: {
                                    lg: "2.2rem",
                                    md: "2.2rem",
                                    sm: "2.2rem",
                                    xs: "2.2rem"
                                }
                            }}
                        />
                    </Link>
                    <ButtonIcon icon={<Close/>} onClick={()=>setOpen(false)}/>
                </Stack>
            }
            <List
                sx={{
                    height: {
                        lg: "90dvh",
                        md: "90dvh",
                        sm: "90dvh",
                        xs: "90dvh"
                    },
                    paddingBottom: {
                        xs: 5
                    },
                    backgroundColor: (theme) => theme.palette.background.paper,
                    overflowY: "auto"
                }}
            >
                {getSidebarItems().map(item => {
                    const Icon = item.icon
                    const isSelected = location.pathname.endsWith(item.href?.replace(".", ""))
                    const basePath = getBaseGamePath()
                    const itemHref = item.relative ? basePath + item.href : item.href
                    return <ListItem key={`sidebar-item-${item.title}`}
                                     title={t(item.title)}
                                     sx={{
                                         backgroundColor: (theme) => isSelected ? theme.palette.background.default : theme.palette.background.paper,
                                         "&:hover": {
                                             backgroundColor: (theme) => theme.palette.background.default
                                         }
                                     }}
                    >
                        <ListItemButton href={itemHref} onClick={()=>setOpen(false)} sx={{margin: 0, padding: 0}}>
                            <ListItemIcon>
                                <Icon color={isSelected ? "primary" : "action"} sx={{fontSize: "2rem"}}/>
                            </ListItemIcon>
                            <Typography hidden={!isOpen}
                                        sx={{fontWeight: isSelected ? "bold" : "normal"}}>{t(item.title)}</Typography>
                        </ListItemButton>
                    </ListItem>
                })}
            </List>
        </Box>
    </Drawer>
}