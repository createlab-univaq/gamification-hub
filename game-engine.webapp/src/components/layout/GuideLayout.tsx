import {Box, Button, Stack} from "@mui/material";
import {Navigate, Outlet, useLocation, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Login, Menu} from "@mui/icons-material";
import {PageHeader} from "./PageHeader.tsx";
import {GuideSidebar} from "../guide/GuideSidebar.tsx";
import {LanguageSelector} from "../LanguageSelector.tsx";
import {ThemeSwitch} from "../ThemeSwitch.tsx";
import {AppIcon} from "../logo/AppIcon.tsx";
import {AppLogo} from "../logo/AppLogo.tsx";
import {ButtonIcon} from "../ButtonIcon.tsx";
import {RouterLink} from "../RouterLink.tsx";
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {useGuideChapters} from "../../hooks/use-guide-chapters.ts";
import {DEFAULT_GUIDE_CHAPTER, guideChapterPath, isGuideChapter} from "../../utils/guide-utils.ts";

export function GuideLayout() {
    const {t} = useTranslation()
    const user = getCurrentUser()
    const {width} = useWindowSize()
    const compact = width < 900
    const {chapter, section} = useParams()
    const {hash} = useLocation()
    const scrollRef = useRef<HTMLDivElement>(null)
    // The tree covers the whole screen on a phone, so it starts away and is asked for.
    const [navOpen, setNavOpen] = useState(false)
    const chapters = useGuideChapters()

    const activeChapter = isGuideChapter(chapter) ? chapter : DEFAULT_GUIDE_CHAPTER

    // A fragment still works for a heading inside the section on screen, which is all one can point at
    // now that a section is a page of its own.
    useEffect(() => {
        if (!hash) {
            return
        }
        document.getElementById(hash.replace("#", ""))?.scrollIntoView({block: "start"})
    }, [hash, section])

    // Every page starts at its own beginning rather than inheriting the last one's scroll position.
    useEffect(() => {
        if (!hash) {
            scrollRef.current?.scrollTo({top: 0})
        }
    }, [activeChapter, section, hash])

    // A chapter that does not exist is corrected in the address bar rather than quietly showing
    // another one, so the URL never disagrees with what is on the page.
    if (!isGuideChapter(chapter)) {
        return <Navigate to={guideChapterPath(DEFAULT_GUIDE_CHAPTER)} replace={true}/>
    }

    return <Stack sx={{height: "100dvh", minHeight: 0}}>
        <PageHeader
            sx={{
                width: "100%",
                p: 1,
                backgroundColor: "background.default",
                borderBottom: "1px solid",
                borderColor: "divider",
                zIndex: 5,
            }}
            title={
                <Stack direction={"row"} sx={{width: "100%", alignItems: "center", justifyContent: "space-between"}}>
                    <Stack direction={"row"}>
                        <Button variant={"text"} onClick={() => setNavOpen(!navOpen)}><Menu/></Button>
                        <Stack direction={"row"} component={RouterLink} href={user ? "/dashboard" : "/"}
                               sx={{gap: 1, p: 1}}>
                            <AppIcon sx={{width: "2.5rem"}}/>
                            <AppLogo sx={{width: {lg: "15rem", md: "15rem", sm: 0, xs: 0}}}/>
                        </Stack>
                    </Stack>
                    <Stack direction={"row"} sx={{alignItems: "center"}}>
                        <LanguageSelector defaultLanguage={"en"}/>
                        <ThemeSwitch/>
                        {/* Every link inside the guide replaces rather than stacks, so one step back
                            is always the page the guide was opened from. */}
                        <ButtonIcon icon={<Login/>} variant={"contained"} onClick={() => history.back()}>
                            {t("guide.exit")}
                        </ButtonIcon>
                    </Stack>
                </Stack>
            }
        />
        <Stack direction={compact ? "column" : "row"} sx={{flex: 1, minHeight: 0}}>
            <GuideSidebar chapters={chapters} activeChapter={activeChapter} activeSlug={section ?? null}
                          compact={compact}
                          open={navOpen} onClose={() => setNavOpen(false)}/>
            <Box ref={scrollRef} sx={{flex: 1, minHeight: 0, overflowY: "auto", px: {xs: 2, sm: 4}, py: 2}}>
                <Box sx={{mx: "auto", pb: 8}}>
                    <Outlet/>
                </Box>
            </Box>
        </Stack>
    </Stack>
}
