import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, Toolbar, Typography} from "@mui/material";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {getSidebarItems} from "./sidebarItems.ts";
import {useLocation} from "react-router-dom";

interface SidebarContextProps {
    isOpen: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

const SidebarContext = createContext<SidebarContextProps>({
    isOpen: false,
    setOpen: () => {
    }
})

const SIDEBAR_OPEN_KEY = "game-engine.ui.sidebar-open"

export const useSidebarContext = () => useContext(SidebarContext)

export function SidebarContextProvider({defaultOpen, children}: PropsWithChildren<{ defaultOpen: boolean }>) {

    const [isOpen, setOpen] = useState(defaultOpen)

    const updateSideBarState = (open: boolean) => {
        setOpen(open)
        localStorage.setItem(SIDEBAR_OPEN_KEY, open)
    }

    useEffect(() => {
        const storageState = localStorage.getItem(SIDEBAR_OPEN_KEY) ?? defaultOpen
        setOpen(storageState)
    }, []);

    return <SidebarContext value={{isOpen, setOpen: updateSideBarState}}>
        {children}
    </SidebarContext>
}

export function SidebarLayout() {

    const {isOpen, setOpen} = useSidebarContext()
    const {width} = useWindowSize()
    const location = useLocation()

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
        return "5%"
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
        <Toolbar/>
        <Box sx={{overflow: 'auto', overflowX: "hidden"}}>
            <List>
                {getSidebarItems().map(item => {
                    const Icon = item.icon
                    const isSelected = location.pathname.endsWith(item.href?.replace(".", ""))
                    return <ListItem key={`sidebar-item-${item.title}`}
                                     sx={{
                                         backgroundColor: (theme) => isSelected ? theme.palette.background.default : theme.palette.background.paper,
                                         "&:hover":{
                                             backgroundColor: (theme) => theme.palette.background.default
                                         }
                                     }}
                    >
                        <ListItemButton href={item.href} sx={{margin: 0, padding: 0}}>
                            <ListItemIcon>
                                <Icon color={isSelected ? "primary" : "background.paper"} sx={{fontSize:"2rem"}}/>
                            </ListItemIcon>
                            <Typography hidden={!isOpen}
                                        sx={{fontWeight: isSelected ? "bold" : "normal"}}>{item.title}</Typography>
                        </ListItemButton>
                    </ListItem>
                })}
            </List>
        </Box>
    </Drawer>
}