import {Box, Button, Stack, Typography} from "@mui/material";
import {Login, MenuBook} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";
import {ThemeSwitch} from "../../components/ThemeSwitch.tsx";
import {AppIcon} from "../../components/logo/AppIcon.tsx";
import {AppLogo} from "../../components/logo/AppLogo.tsx";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {
    BuildRulesIllustration,
    DesignGamesIllustration,
    LaunchChallengesIllustration,
    LeaderboardIllustration,
    SafeTestingIllustration
} from "../../components/illustrations/HighlightIllustrations.tsx";
import {Footer} from "../../components/layout/Footer.tsx";

const HIGHLIGHT_ILLUSTRATIONS = [
    DesignGamesIllustration,
    BuildRulesIllustration,
    SafeTestingIllustration,
    LeaderboardIllustration,
    LaunchChallengesIllustration
]

const HEADER_HEIGHT = "74px"

interface HighlightBlob {
    color: string
    size: number
    opacity: number
    top?: string
    left?: string
    right?: string
    bottom?: string
}

const VISUAL_BLOB_LAYOUTS: HighlightBlob[][] = [
    [
        {color: "primary.main", size: 320, top: "-15%", left: "-8%", opacity: 0.18},
        {color: "success.main", size: 220, bottom: "-15%", left: "18%", opacity: 0.16}
    ],
    [
        {color: "warning.main", size: 300, top: "-12%", right: "-8%", opacity: 0.2},
        {color: "primary.main", size: 240, bottom: "-18%", right: "16%", opacity: 0.16}
    ],
    [
        {color: "primary.main", size: 340, bottom: "-18%", left: "-8%", opacity: 0.16},
        {color: "warning.main", size: 210, top: "-10%", left: "20%", opacity: 0.2}
    ],
    [
        {color: "success.main", size: 310, top: "-14%", right: "-8%", opacity: 0.18},
        {color: "primary.main", size: 230, bottom: "-16%", right: "18%", opacity: 0.16}
    ],
    [
        {color: "warning.main", size: 300, bottom: "-16%", left: "-10%", opacity: 0.18},
        {color: "success.main", size: 220, top: "-12%", right: "20%", opacity: 0.16}
    ]
]

const CTA_BLOB_LAYOUT: HighlightBlob[] = [
    {color: "primary.main", size: 340, top: "-18%", left: "-6%", opacity: 0.16},
    {color: "warning.main", size: 280, bottom: "-16%", right: "-6%", opacity: 0.16},
    {color: "success.main", size: 220, top: "-10%", right: "18%", opacity: 0.14}
]

function HighlightGraphic({Illustration, index, reversed}: {
    Illustration: typeof HIGHLIGHT_ILLUSTRATIONS[number],
    index: number,
    reversed: boolean
}) {
    const blobs = VISUAL_BLOB_LAYOUTS[index % VISUAL_BLOB_LAYOUTS.length]
    const fade = `linear-gradient(${reversed ? "to left" : "to right"}, black 0%, black 45%, transparent 85%)`
    return <Box sx={{
        position: "absolute",
        inset: 0,
        display: {xs: "none", md: "block"},
        overflow: "hidden",
        maskImage: fade,
        WebkitMaskImage: fade
    }}>
        {blobs.map((blob, blobIndex) => (
            <Box key={blobIndex} sx={{
                position: "absolute",
                width: blob.size,
                height: blob.size,
                borderRadius: "50%",
                backgroundColor: blob.color,
                opacity: blob.opacity,
                filter: "blur(12px)",
                top: blob.top,
                left: blob.left,
                right: blob.right,
                bottom: blob.bottom
            }}/>
        ))}
        <Stack direction={"row"} sx={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: reversed ? "flex-end" : "flex-start",
            px: {md: 4, lg: 8}
        }}>
            <Box sx={{width: {md: 340, lg: 460}, height: {md: 272, lg: 368}}}>
                <Illustration/>
            </Box>
        </Stack>
    </Box>
}

export function LandingPage() {

    const {t} = useTranslation()

    const highlights = t("landing.highlights", {returnObjects: true}) as {
        title: string,
        description: string
    }[]

    return <PageContainer sx={{
        padding: 0,
        scrollbarWidth: "none",
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        scrollSnapType: "y mandatory",
        scrollPaddingTop: HEADER_HEIGHT
    }}>
        <PageHeader
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                p: 1,
                backgroundColor: "background.default",
                borderBottom: "1px solid",
                borderColor: "divider",
                zIndex: 5,
            }}
            title={
                <Stack direction={"row"} sx={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <Stack direction={"row"} sx={{alignItems: "center", gap: 1, p: 1}}>
                        <AppIcon sx={{width: "2.5rem"}}/>
                        <AppLogo
                            sx={{
                                width: {
                                    lg: "15rem",
                                    md: "15rem",
                                    sm: 0,
                                    xs: 0
                                }
                            }}
                        />
                    </Stack>
                    <Stack direction={"row"} sx={{alignItems: "center"}}>
                        <LanguageSelector defaultLanguage={"en"}/>
                        <ThemeSwitch/>
                        <Button variant={"contained"} href={"/login"} endIcon={<Login/>}>{t("buttons:sign_in")}</Button>
                    </Stack>
                </Stack>
            }
        />

        <Stack sx={{
            alignItems: "center",
            textAlign: "center",
            pt: HEADER_HEIGHT,
            scrollSnapAlign: "start",
            background: (theme) => `linear-gradient(180deg, ${theme.palette.action.hover} 0%, transparent 100%)`
        }}>
            <Stack
                sx={{
                    width: {
                        lg: "60%",
                        md: "60%"
                    },
                    gap: 3,
                    px: 3,
                    py: {xs: 6, sm: 10},
                }}
            >
                <Typography
                    variant={"h2"}
                    sx={{
                        fontSize: {
                            lg: "4rem",
                            md: "4rem",
                            sm: "2rem",
                            xs: "2rem"
                        }
                    }}
                >
                    {t("landing.hero.title")}
                </Typography>
                <Typography
                    variant={"h6"}
                    color={"text.secondary"}
                    sx={{
                        fontWeight: 400,
                        fontSize: {
                            lg: "2rem",
                            md: "2rem",
                            sm: "1rem",
                            xs: "1rem"
                        }
                    }}
                >
                    {t("landing.hero.subtitle")}
                </Typography>
                <Stack direction={"row"} sx={{gap: 2, flexWrap: "wrap", justifyContent: "center", mt: 1}}>
                    <Button href={"/login"} variant={"contained"} size={"large"} endIcon={<Login/>}>
                        {t("buttons:sign_in")}
                    </Button>
                    <Button href={"/guide"} variant={"outlined"} size={"large"} endIcon={<MenuBook/>}>
                        {t("sidebar.guide")}
                    </Button>
                </Stack>
            </Stack>
        </Stack>

        {highlights.map((highlight, index) => {
            const Illustration = HIGHLIGHT_ILLUSTRATIONS[index]
            const reversed = index % 2 === 1
            return <Box key={`highlight-${index}`}
                        sx={{
                            position: "relative",
                            width: "100%",
                            minHeight: {xs: "100dvh", md: "100vh"},
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            scrollSnapAlign: "start",
                            scrollSnapStop: "always",
                            backgroundColor: reversed ? "action.hover" : "transparent"
                        }}>
                <HighlightGraphic Illustration={Illustration} index={index} reversed={reversed}/>
                <Stack direction={{xs: "column", md: "row"}} sx={{
                    position: "relative",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: {xs: "center", md: reversed ? "flex-start" : "flex-end"},
                    gap: {xs: 3, md: 8, lg: 12},
                    maxWidth: {xs: 1100, lg: 1400},
                    mx: "auto",
                    px: {xs: 3, sm: 6},
                    py: {xs: 6, sm: 8, lg: 10}
                }}
                >
                    <Box sx={{display: {xs: "block", md: "none"}, width: "20rem", height: "20rem"}}>
                        <Illustration/>
                    </Box>
                    <Stack sx={{
                        gap: {xs: 1, md: 2},
                        maxWidth: {md: 520, lg: 620},
                        textAlign: {xs: "center", md: "left"},
                        alignItems: {xs: "center", md: "flex-start"}
                    }}>
                        <Typography variant={"h4"}
                                    sx={{
                                        fontWeight: 700,
                                        color: "primary.main",
                                        fontSize: {xs: "1.75rem", md: "2.25rem", lg: "2.75rem"}
                                    }}>
                            {highlight.title}
                        </Typography>
                        <Typography variant={"body1"} color={"text.secondary"}
                                    sx={{fontSize: {xs: "1rem", lg: "1.15rem"}}}>
                            {highlight.description}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        })}

        <Box sx={{
            position: "relative",
            width: "100%",
            minHeight: {xs: "100dvh", md: "100vh"},
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            backgroundColor: "action.hover"
        }}>
            {CTA_BLOB_LAYOUT.map((blob, blobIndex) => (
                <Box key={blobIndex} sx={{
                    position: "absolute",
                    width: blob.size,
                    height: blob.size,
                    borderRadius: "50%",
                    backgroundColor: blob.color,
                    opacity: blob.opacity,
                    filter: "blur(12px)",
                    top: blob.top,
                    left: blob.left,
                    right: blob.right,
                    bottom: blob.bottom
                }}/>
            ))}
            <Stack sx={{
                position: "relative",
                alignItems: "center",
                textAlign: "center",
                gap: 2,
                width: "100%",
                maxWidth: {xs: 1100, lg: 1400},
                mx: "auto",
                px: {xs: 3, sm: 6},
                py: {xs: 6, sm: 8, lg: 10}
            }}>
                <AppIcon sx={{width: {xs: "6rem", md: "10rem"}, mb: 1}}/>
                <Typography variant={"h4"}
                            sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                fontSize: {xs: "1.75rem", md: "2.25rem", lg: "2.75rem"}
                            }}>
                    {t("landing.cta.title")}
                </Typography>
                <Typography variant={"body1"} color={"text.secondary"}
                            sx={{maxWidth: 560, fontSize: {xs: "1rem", lg: "1.15rem"}}}>
                    {t("landing.cta.subtitle")}
                </Typography>
                <Button href={"/login"} variant={"contained"} size={"large"}
                        sx={{mt: 1}} endIcon={<Login/>}>
                    {t("buttons:sign_in")}
                </Button>
            </Stack>
        </Box>
        <Footer/>
    </PageContainer>

}
