import {Button, Stack, Typography} from "@mui/material";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {RouterLink} from "../RouterLink.tsx";
import type {GuideStop} from "../../utils/guide-utils.ts";

interface GuideNavigationProps {
    previous?: GuideStop
    next?: GuideStop
    // Where the reader is, so a step into another chapter can say which one.
    chapterSlug: string
}

function StopButton({stop, direction, chapterSlug}: {
    stop: GuideStop,
    direction: "previous" | "next",
    chapterSlug: string
}) {
    const [t] = useTranslation()
    const leavesTheChapter = stop.chapterSlug !== chapterSlug
    const isNext = direction === "next"

    return <Button
        component={RouterLink}
        href={stop.path}
        replace={true}
        variant={"outlined"}
        startIcon={isNext ? undefined : <ChevronLeft/>}
        endIcon={isNext ? <ChevronRight/> : undefined}
        sx={{
            flex: 1,
            justifyContent: isNext ? "flex-end" : "flex-start",
            textAlign: isNext ? "right" : "left",
            textTransform: "none",
            py: 1.5
        }}
    >
        {/* Spans rather than the default paragraph, because these sit inside a link. */}
        <Stack component={"span"} sx={{alignItems: isNext ? "flex-end" : "flex-start"}}>
            <Typography component={"span"} variant={"caption"}
                        sx={{color: "text.secondary", lineHeight: 1.2}}>
                {/* A step within the chapter is just a direction; a step out of it names where it goes,
                    because the title alone would not say that the chapter has changed. */}
                {leavesTheChapter ? stop.chapterTitle : isNext ? t("guide.next") : t("guide.previous")}
            </Typography>
            <Typography component={"span"} variant={"body2"} sx={{fontWeight: 600, lineHeight: 1.3}}>
                {stop.title}
            </Typography>
        </Stack>
    </Button>
}

// Sits under a section and moves one page at a time, forwards to the end of the guide and back to the
// beginning, so the whole thing can be read in order without returning to the navigation tree.
export function GuideNavigation({previous, next, chapterSlug}: GuideNavigationProps) {
    if (!previous && !next) {
        return <></>
    }

    return <Stack direction={{xs: "column", sm: "row"}} sx={{gap: 2}}>
        {previous
            ? <StopButton stop={previous} direction={"previous"} chapterSlug={chapterSlug}/>
            : <Stack sx={{flex: 1}}/>}
        {next
            ? <StopButton stop={next} direction={"next"} chapterSlug={chapterSlug}/>
            : <Stack sx={{flex: 1}}/>}
    </Stack>
}
