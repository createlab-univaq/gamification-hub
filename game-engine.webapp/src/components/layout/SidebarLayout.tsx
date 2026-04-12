import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState} from "react";
import {Box, Drawer, List, ListItem, ListItemIcon, Toolbar, Typography} from "@mui/material";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {sidebarItems} from "./sidebarItems.ts";

interface SidebarContextProps {
    isOpen: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

const SidebarContext = createContext<SidebarContextProps>({
    isOpen: false,
    setOpen: () => {
    }
})

export const useSidebarContext = () => useContext(SidebarContext)

export function SidebarContextProvider({defaultOpen, children}: PropsWithChildren<{ defaultOpen: boolean }>) {

    const [isOpen, setOpen] = useState(defaultOpen)

    return <SidebarContext value={{isOpen, setOpen}}>
        {children}
    </SidebarContext>
}

export function SidebarLayout() {

    const {isOpen, setOpen} = useSidebarContext()
    const {width} = useWindowSize()

    const sidebarWidth = useMemo(() => {
        if (width < 800) {
            if (isOpen) {
                return "50%"
            }
            return "40%"
        }
        if (isOpen) {
            return "10%"
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
                p: "0.5rem",
            }
        }}
    >
        <Toolbar/>
        <Box sx={{overflow: 'auto', overflowX:"hidden"}}>
            <List>
                {sidebarItems.map(item=>{
                    const Icon = item.icon
                    return <ListItem key={`sidebar-item-${item.title}`}>
                        <ListItemIcon>
                            <Icon/>
                        </ListItemIcon>
                        <Typography hidden={!isOpen}>{item.title}</Typography>
                    </ListItem>
                })}
            </List>
        </Box>
    </Drawer>
}