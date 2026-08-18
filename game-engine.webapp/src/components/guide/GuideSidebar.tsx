import type {Theme} from "@mui/material";
import {
    Box,
    Collapse,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Close, ExpandLess, ExpandMore, Search} from "@mui/icons-material";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import type {GuideChapter} from "../../utils/guide-utils.ts";
import {alpha} from "@mui/material/styles";
import {guideChapterPath, guideSectionPath, MIN_SEARCH_LENGTH, splitHighlights} from "../../utils/guide-utils.ts";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {useGuideSearch} from "../../hooks/use-guide-search.ts";
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {AppIcon} from "../logo/AppIcon.tsx";
import {AppLogo} from "../logo/AppLogo.tsx";
import {ButtonIcon} from "../ButtonIcon.tsx";
import {RouterLink} from "../RouterLink.tsx";

// The theme's own hover for a list button is a translucent white, which the application's sidebar
// sidesteps by colouring the row's wrapper instead. These items are the buttons themselves, so they
// state the same colours directly and end up matching it.
const ITEM_SX = {
    borderRadius: 1,
    "&:hover": {backgroundColor: (theme: Theme) => theme.palette.background.default},
    "&.Mui-selected": {
        backgroundColor: (theme: Theme) => theme.palette.background.default,
        "&:hover": {backgroundColor: (theme: Theme) => theme.palette.background.default}
    }
}

// A chapter row is one item to look at and two to click, so the highlight belongs to the row and its
// halves stay transparent. Without this each half would light up on its own and the row would look
// like two buttons.
const CHAPTER_ROW_SX = {
    borderRadius: 1,
    px: 1,
    gap:0,
    "&:hover": {
        backgroundColor: (theme: Theme) => theme.palette.background.default,
        cursor: "pointer"
    }
}

const CHAPTER_PART_SX = {
    flexDirection: "row-reverse",
    px: 1,
    mx:0,
    backgroundColor: "transparent",
    "&:hover": {backgroundColor: "transparent"},
    flex: 1
}

// Marks the words that were searched for, so a result shows why it came up rather than only where.
function Highlighted({text, query}: { text: string, query: string }) {
    return <>
        {splitHighlights(text, query).map((segment, index) => segment.match
            ? <Box key={index} component={"mark"} sx={{
                backgroundColor: (theme: Theme) => alpha(theme.palette.primary.dark, 0.5),
                color: "primary.contrastText",
                borderRadius: 0.5,
                fontWeight:"bold"
            }}>{segment.text}</Box>
            : <Box key={index} component={"span"}>{segment.text}</Box>)}
    </>
}

interface GuideSidebarProps {
    chapters: GuideChapter[]
    activeChapter: string
    activeSlug: string | null
    compact: boolean
    open: boolean
    onClose: () => void
}

export function GuideSidebar({
                                 chapters,
                                 activeChapter,
                                 activeSlug,
                                 compact,
                                 open,
                                 onClose
                             }: GuideSidebarProps) {
    const {t} = useTranslation()
    const user = getCurrentUser()
    // Which chapters are unfolded is the reader's business and independent of what they are reading,
    // so another chapter can be opened and browsed without leaving the current one.
    const [expanded, setExpanded] = useState<string[]>([activeChapter])

    const toggle = (slug: string) => setExpanded(prev =>
        prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])

    const expand = (slug: string) => setExpanded(prev =>
        prev.includes(slug) ? prev : [...prev, slug])

    // What has been typed and what has been searched are kept apart: the field stays immediate while the
    // scan waits for a pause, so a long word is looked for once instead of once per letter.
    const [typed, setTyped] = useState("")
    const [query, setQuery] = useState("")
    const search = useDebounced((value: string) => setQuery(value), 250)
    const hits = useGuideSearch(query)

    const clearSearch = () => {
        setTyped("")
        setQuery("")
    }

    const field = <Box sx={{px: 1, py: 1, backgroundColor: (theme) => theme.palette.background.paper}}>
        <TextField
            fullWidth={true}
            size={"small"}
            value={typed}
            placeholder={t("guide.search")}
            onChange={(event) => {
                setTyped(event.target.value)
                search(event.target.value)
            }}
            slotProps={{
                input: {
                    startAdornment: <Search fontSize={"small"} sx={{mr: 1, color: "text.secondary"}}/>,
                    endAdornment: typed
                        ? <IconButton size={"small"} aria-label={t("buttons:clear")} onClick={clearSearch}>
                            <Close fontSize={"small"}/>
                        </IconButton>
                        : undefined
                }
            }}
        />
    </Box>

    const results = <List sx={{
        flex: 1,
        overflowY: "auto",
        backgroundColor: (theme) => theme.palette.background.paper
    }}>
        {hits.length === 0 &&
            <Typography variant={"body2"} sx={{px: 2, py: 1, color: "text.secondary"}}>
                {t("guide.no_results")}
            </Typography>}
        {hits.map((hit) =>
            <ListItemButton
                key={`${hit.chapterSlug}-${hit.sectionId}`}
                component={RouterLink}
                href={hit.path}
                replace={true}
                onClick={()=>{
                    clearSearch()
                    onClose()
                }}
                sx={{...ITEM_SX, display: "block", py: 1}}
            >
                <Typography variant={"caption"} sx={{color: "text.secondary", display: "block"}}>
                    {hit.chapterTitle}
                </Typography>
                <Typography variant={"body2"} sx={{fontWeight: 700, color: "text.primary"}}>
                    <Highlighted text={hit.title} query={query}/>
                </Typography>
                <Typography variant={"caption"} sx={{
                    color: "text.secondary",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                }}>
                    <Highlighted text={hit.snippet} query={query}/>
                </Typography>
            </ListItemButton>
        )}
    </List>

    const tree = <List sx={{
        flex: 1,
        overflowY: "scroll",
        backgroundColor: (theme) => theme.palette.background.paper
    }}>
        {chapters.map((chapter) => {
            const unfolded = expanded.includes(chapter.slug)
            const reading = chapter.slug === activeChapter
            const Icon = chapter.icon
            return <Box key={chapter.slug}>
                {/* Only the icon and the label open the chapter; the rest of the row folds it. On a
                    phone that puts the larger target on the more common action and keeps an accidental
                    tap from leaving the section list. The two are siblings rather than nested, so a
                    button never sits inside the link. */}
                <Stack direction={"row"}
                       sx={{...CHAPTER_ROW_SX, alignItems: "center"}}
                       onClick={() => {
                           toggle(chapter.slug)
                       }}>
                    <ListItemButton
                        component={RouterLink}
                        href={guideChapterPath(chapter.slug)}
                        replace={true}
                        onClick={(event) => {
                            // The row toggles, so the label has to keep the click to itself: opening a
                            // chapter unfolds it, and never folds one that was already open.
                            event.stopPropagation()
                            expand(chapter.slug)
                            onClose()
                        }}
                        sx={{
                            mx:0,
                            px:1,
                            gap: 1,
                            flexGrow: 0,
                            flexShrink: 1,
                            flexBasis: "auto",
                            maxWidth: "fit-content",
                            flexDirection: "row",
                            // The label and the icon carry their own colours, so the hover has to
                            // reach them rather than set one on the button they sit in.
                            "&:hover": {
                                "& .MuiListItemText-primary": {color: "primary.main"},
                                "& .MuiSvgIcon-root": {color: "primary.main"}
                            }
                        }}
                    >
                        {/* The icon sits beside the label rather than inside it, as the application's
                            own sidebar has it: the label is a paragraph, which cannot hold one. */}
                        <ListItemIcon sx={{minWidth: 0, mr: 1}}>
                            <Icon color={reading ? "primary" : "action"}/>
                        </ListItemIcon>
                        <ListItemText
                            primary={chapter.title}
                            sx={{flexGrow: 0, my: 0}}
                            slotProps={{
                                primary: {
                                    variant: "body2",
                                    sx: {fontWeight: 700, color: reading ? "primary.main" : "text.primary"}
                                }
                            }}
                        />
                    </ListItemButton>
                    <ListItemButton
                        aria-label={t("guide.sections")}
                        aria-expanded={unfolded}
                        sx={CHAPTER_PART_SX}
                    >
                        {unfolded ? <ExpandLess fontSize={"small"}/> : <ExpandMore fontSize={"small"}/>}
                    </ListItemButton>
                </Stack>
                <Collapse in={unfolded} timeout={"auto"} unmountOnExit={true}>
                    <List disablePadding={true}
                          sx={{
                              ml: 3.5,
                              borderLeftWidth: 1,
                              borderLeftColor: "primary.dark",
                              borderLeftStyle: "solid"
                          }}
                    >
                        {chapter.sections.map((section) => {
                            const selected = reading && section.id === activeSlug
                            return <ListItemButton
                                key={section.id}
                                selected={selected}
                                // A real link, so every section can be shared or opened in a new tab.
                                // It replaces rather than stacks, so moving around the guide leaves no
                                // history behind it and going back returns to the page it was opened
                                // from.
                                component={RouterLink}
                                href={guideSectionPath(chapter.slug, section.id)}
                                replace={true}
                                onClick={(event) => {
                                    // The row above folds on click, so a section has to keep its own.
                                    // On a phone the tree covers the page, so reading anything means
                                    // closing it first, whichever chapter was picked.
                                    event.stopPropagation()
                                    onClose()
                                }}
                                sx={{
                                    ...ITEM_SX,
                                    "&:hover": {
                                        "& .MuiListItemText-primary": {color: "primary.main"},
                                        "& .MuiSvgIcon-root": {color: "primary.main"}
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={section.title}
                                    slotProps={{
                                        primary: {
                                            variant: "body2",
                                            sx: {
                                                fontWeight: selected ? 700 : 400,
                                                color: selected ? "primary.main" : "text.primary"
                                            }
                                        }
                                    }}
                                />
                            </ListItemButton>
                        })}
                    </List>
                </Collapse>
            </Box>
        })}
    </List>

    // One drawer for both sizes, as the application's own sidebar does: permanent alongside the page
    // on a wide screen, and over the whole of a narrow one until it is dismissed.
    const width = compact ? "100%" : 280

    return <Drawer
        variant={compact ? "temporary" : "permanent"}
        ModalProps={{keepMounted: false}}
        open={open}
        onClose={onClose}
        sx={{
            flexShrink: 0,
            width: width,
            [`& .MuiDrawer-paper`]: {
                width: width,
                boxSizing: "border-box",
                // The guide's header is part of the page rather than a fixed bar, so on a wide screen
                // the panel flows inside the layout instead of being pinned over it.
                position: compact ? "fixed" : "relative"
            }
        }}
    >
        {/* Over a whole narrow screen the panel replaces the header, so it carries the logo and its
            own way out; a full-width sheet leaves no backdrop to tap. */}
        {compact &&
            <>
                <Stack direction={"row"} sx={{px: 1, py: 0.5, alignItems: "center", justifyContent: "space-between"}}>
                    <Link to={user ? "/dashboard" : "/"} style={{display: "flex", alignItems: "center"}}>
                        <AppIcon sx={{width: "3rem"}}/>
                        <AppLogo sx={{width: "75%", height: "2.2rem"}}/>
                    </Link>
                    <ButtonIcon icon={<Close/>} onClick={onClose}/>
                </Stack>
                <Divider/>
            </>
        }
        {field}
        {/* While something is being searched the results stand in for the tree: a heading on its own
            cannot show why a section matched, and the snippet can. */}
        {query.trim().length >= MIN_SEARCH_LENGTH ? results : tree}
    </Drawer>
}
