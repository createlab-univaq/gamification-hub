import type {ReactElement} from "react";
import {Games} from "@mui/icons-material"

interface SidebarItem {
    title:string
    icon:ReactElement
}


export const sidebarItems = [
    {
        title:"Giochi",
        icon: Games
    },
    {
        title:"Players",
        icon: Games
    }
] satisfies SidebarItem[]