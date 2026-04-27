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
    href: string,
    relative?: boolean
}

const dashboardItems = [
    {
        title: "Games",
        icon: Games,
        href: "/dashboard"
    }
] satisfies SidebarItem[]

const gameItems = [
    {
        title: "Rules",
        icon: Rule,
        href: "/rules",
        relative: true
    },
    {
        title: "Actions",
        icon: PlayArrow,
        href: "/actions",
        relative: true
    },
    {
        title: "Point Concepts",
        icon: EmojiEvents,
        href: "/points",
        relative: true
    },
    {
        title: "Tasks",
        icon: Checklist,
        href: "/tasks",
        relative: true
    },
    {
        title: "Badges",
        icon: MilitaryTech,
        href: "/badges",
        relative: true
    },
    {
        title: "Levels",
        icon: Layers,
        relative: true
    },
    {
        title: "Challenges",
        icon: FormatListNumbered,
        relative: true
    },
    {
        title: "Monitors",
        icon: Monitor,
        relative: true
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