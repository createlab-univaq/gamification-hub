import {createContext, useContext} from "react";

export interface SidebarContextProps {
    isOpen: boolean
    setOpen: (isOpen: boolean) => void
}

export const UseSidebarContext = createContext<SidebarContextProps>({
    isOpen: false,
    setOpen: () => {
    }
})

export const useSidebarContext = () => useContext(UseSidebarContext)