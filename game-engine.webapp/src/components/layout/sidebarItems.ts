import type {SvgIconComponent} from "@mui/icons-material"
import {
    Bolt,
    Diversity3,
    Games,
    Layers,
    Leaderboard,
    MilitaryTech,
    People,
    Rule,
    Science,
    SportsScore,
    Stars
} from "@mui/icons-material"

interface SidebarItem {
    title: string
    icon: SvgIconComponent,
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
        icon: Bolt,
        href: "/actions",
        relative: true
    },
    {
        title: "sidebar.points",
        icon: Stars,
        href: "/points",
        relative: true
    },
    {
        title: "sidebar.players",
        icon: People,
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
        title: "sidebar.classifications",
        icon: Leaderboard,
        href: "/classifications",
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
        icon: SportsScore,
        relative: true
    }
] satisfies SidebarItem[]

export const getSidebarItems = () => {
    const location = window.location.pathname
    const basePath = location.split("/").at(1) ?? "dashboard"
    return SIDEBAR_ITEMS[basePath] ?? dashboardItems
}

const SIDEBAR_ITEMS = {
    "dashboard": dashboardItems,
    "games": [...dashboardItems, ...gameItems],
} as Record<string, SidebarItem[]>