import {type PropsWithChildren, useMemo, useState} from "react";
import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, Stack, Toolbar, Typography} from "@mui/material";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {getSidebarItems} from "./sidebarItems.ts";
import {useLocation} from "react-router-dom";
import {SIDEBAR_OPEN_KEY} from "../../utils/storage-utils.ts";
import {getBaseGamePath} from "../../utils/navigation-utils.ts";
import {useTranslation} from "react-i18next";
import {UseSidebarContext, useSidebarContext} from "../../hooks/use-sidebar-context.ts";
import {UnivaqLogo} from "../logo/UnivaqLogo.tsx";
import {AppLogo} from "../logo/AppLogo.tsx";
import {AppIcon} from "../logo/AppIcon.tsx";


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
                return "50%"
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
                <Stack direction={"row"} sx={{p: 1}}>
                    <a href={"/dashboard"} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <UnivaqLogo
                            sx={{
                                width: "4.5rem"
                            }}
                        />
                        <AppIcon
                            sx={{
                                width: "4rem"
                            }}
                        />
                        <AppLogo
                            sx={{
                                width: {
                                    lg: "50%",
                                    md: "50%",
                                    sm: "50%",
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
                    </a>
                </Stack>
            }
            <List
                sx={{
                    height: {
                        lg:"90dvh",
                        md:"90dvh",
                        sm:"90dvh",
                        xs:"90dvh"
                    },
                    paddingBottom:{
                      xs:5
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
                        <ListItemButton href={itemHref} sx={{margin: 0, padding: 0}}>
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