import type {ReactElement} from "react";
import {
    Checklist,
    EmojiEvents,
    FormatListNumbered,
    Games,
    Layers,
    MilitaryTech,
    Monitor,
    PlayArrow,
    Rule
} from "@mui/icons-material"

interface SidebarItem {
    title: string
    icon: ReactElement,
    href: string
}

const dashboardItems = [
    {
        title: "Games",
        icon: Games,
        href: "/dashboard",
        relative: "path"
    }
] satisfies SidebarItem[]

const gameItems = [
    {
        title: "Rules",
        icon: Rule,
        href: "./rules",

    },
    {
        title: "Actions",
        icon: PlayArrow,
        href: "./actions"
    },
    {
        title: "Point Concepts",
        icon: EmojiEvents,
        href: "./points"
    },
    {
        title: "Tasks",
        icon: Checklist,
        href: "./tasks"
    },
    {
        title: "Badges",
        icon: MilitaryTech,
        href: "./badges"
    },
    {
        title: "Levels",
        icon: Layers
    },
    {
        title: "Challenges",
        icon: FormatListNumbered
    },
    {
        title: "Monitors",
        icon: Monitor
    }
] satisfies SidebarItem[]

export const getSidebarItems = () => {
    const location = window.location.pathname
    const basePath = location.split("/").at(1)
    return SIDEBAR_ITEMS[basePath] ?? dashboardItems
}

const SIDEBAR_ITEMS = {
    "dashboard": dashboardItems,
    "games": [...dashboardItems, ...gameItems],
} satisfies Record<string, SidebarItem[]>