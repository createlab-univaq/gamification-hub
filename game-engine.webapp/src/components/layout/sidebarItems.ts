import type {ReactElement} from "react";
import {
    Checklist,
    Diversity3,
    EmojiEvents,
    FormatListNumbered,
    Games,
    Groups,
    Layers,
    MilitaryTech,
    Monitor,
    PlayArrow,
    Rule,
    Science
} from "@mui/icons-material"

interface SidebarItem {
    title: string
    icon: ReactElement,
    href: string,
    relative?: boolean
}

const dashboardItems = [
    {
        title: "sidebar.games",
        icon: Games,
        href: "/dashboard"
    }
] satisfies SidebarItem[]

const gameItems = [
    {
        title: "sidebar.rules",
        icon: Rule,
        href: "/rules",
        relative: true
    },
    {
        title: "sidebar.actions",
        icon: PlayArrow,
        href: "/actions",
        relative: true
    },
    {
        title: "sidebar.points",
        icon: EmojiEvents,
        href: "/points",
        relative: true
    },
    {
        title: "sidebar.players",
        icon: Groups,
        href: "/players",
        relative: true
    },
    {
        title: "sidebar.teams",
        icon: Diversity3,
        href: "/teams",
        relative: true
    },
    {
        title: "sidebar.activities",
        icon: Checklist,
        href: "/tasks",
        relative: true
    },
    {
        title: "sidebar.badges",
        icon: MilitaryTech,
        href: "/badges",
        relative: true
    },
    {
        title: "sidebar.levels",
        href: "/levels",
        icon: Layers,
        relative: true
    },
    {
        title: "sidebar.scenarios",
        href: "/scenarios",
        icon: Science,
        relative: true
    },
    {
        title: "sidebar.challenges",
        href: "/challenges",
        icon: FormatListNumbered,
        relative: true
    },
    {
        title: "sidebar.monitors",
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