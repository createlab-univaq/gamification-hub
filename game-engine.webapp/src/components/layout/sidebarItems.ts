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
    Rule,
    Groups,
    Diversity3,
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
        title: "Giochi",
        icon: Games,
        href: "/dashboard"
    }
] satisfies SidebarItem[]

const gameItems = [
    {
        title: "Regole",
        icon: Rule,
        href: "/rules",
        relative: true
    },
    {
        title: "Azioni",
        icon: PlayArrow,
        href: "/actions",
        relative: true
    },
    {
        title: "Punteggi",
        icon: EmojiEvents,
        href: "/points",
        relative: true
    },
    {
        title: "Giocatori",
        icon: Groups,
        href: "/players",
        relative: true
    },
    {
        title: "Squadre",
        icon: Diversity3,
        href: "/teams",
        relative: true
    },
    {
        title: "Attività",
        icon: Checklist,
        href: "/tasks",
        relative: true
    },
    {
        title: "Medaglie",
        icon: MilitaryTech,
        href: "/badges",
        relative: true
    },
    {
        title: "Livelli",
        href:"/levels",
        icon: Layers,
        relative: true
    },
    {
        title: "Scenari",
        href: "/scenarios",
        icon: Science,
        relative: true
    },
    {
        title: "Sfide",
        href: "/challenges",
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