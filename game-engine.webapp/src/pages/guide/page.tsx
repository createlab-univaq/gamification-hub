import {useEffect, useMemo, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useTranslation} from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Box,
    Link as MuiLink,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {docsClient} from "../../api";
import type {Language} from "../../utils/lng-utils.ts";
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Navigate} from "react-router-dom";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";
import {type GuideSection, GuideSidebar} from "../../components/guide/GuideSidebar.tsx";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {ThemeSwitch} from "../../components/ThemeSwitch.tsx";
import {AppIcon} from "../../components/logo/AppIcon.tsx";
import {AppLogo} from "../../components/logo/AppLogo.tsx";
import {Login} from "@mui/icons-material";
import {ButtonIcon} from "../../components/ButtonIcon.tsx";
import {RouterLink} from "../../components/RouterLink.tsx";

function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
    const rest: Record<string, unknown> = {...props}
    delete rest.node
    return rest as Omit<T, "node">
}

function cellAlign(align?: string | null) {
    return align === "left" || align === "right" || align === "center" ? align : undefined
}

function slugify(text: string): string {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function nodeText(children: unknown): string {
    if (children == null || children === false) return ""
    if (typeof children === "string" || typeof children === "number") return String(children)
    if (Array.isArray(children)) return children.map(nodeText).join("")
    if (typeof children === "object" && "props" in children) {
        return nodeText((children as { props: { children?: unknown } }).props.children)
    }
    return ""
}

export function GuidePage() {
    const {i18n, t} = useTranslation()
    const user = getCurrentUser()
    const {width} = useWindowSize()
    const compact = width < 900
    const scrollRef = useRef<HTMLDivElement>(null)
    const [activeSlug, setActiveSlug] = useState<string | null>(null)

    const {data, isLoading, error} = useQuery({
        queryKey: ["app-guide", i18n.language],
        queryFn: () => docsClient.getAppGuide(i18n.language as Language)
    })

    const sections: GuideSection[] = useMemo(() => {
        if (!data) return []
        return data.split("\n")
            .filter((line) => /^##\s+/.test(line))
            .map((line) => {
                const title = line.replace(/^##\s+/, "").trim()
                return {title, slug: slugify(title)}
            })
    }, [data])

    useEffect(() => {
        if (!data || sections.length === 0) return
        const root = scrollRef.current
        if (!root) return
        const computeActive = () => {
            const rootTop = root.getBoundingClientRect().top
            const marker = 140
            let current = sections[0]?.slug ?? null
            for (const section of sections) {
                const el = document.getElementById(section.slug)
                if (!el) continue
                if (el.getBoundingClientRect().top - rootTop <= marker) {
                    current = section.slug
                } else {
                    break
                }
            }
            if (root.scrollTop + root.clientHeight >= root.scrollHeight - 4) {
                current = sections[sections.length - 1]?.slug ?? current
            }
            setActiveSlug((prev) => (prev === current ? prev : current))
        }
        let frame = 0
        const onScroll = () => {
            if (frame) return
            frame = requestAnimationFrame(() => {
                frame = 0
                computeActive()
            })
        }
        computeActive()
        root.addEventListener("scroll", onScroll, {passive: true})
        return () => {
            root.removeEventListener("scroll", onScroll)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [data, sections])

    const scrollToSection = (slug: string) => {
        setActiveSlug(slug)
        document.getElementById(slug)?.scrollIntoView({behavior: "smooth", block: "start"})
    }

    const effectiveActive = activeSlug ?? sections[0]?.slug ?? null

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={user ? "/dashboard" : "/login"} replace={true} state={errorMessage}/>
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
                <Stack direction={"row"} sx={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <Stack direction={"row"} component={RouterLink} href={user ? "/dashboard" : "/"}
                           sx={{alignItems: "center", gap: 1, p: 1}}>
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
                        <ButtonIcon
                            icon={<Login/>}
                            variant={"contained"}
                            href={user ? "/dashboard" : "/"}
                        >
                            {t("buttons:turn_back")}
                        </ButtonIcon>
                    </Stack>
                </Stack>
            }
        />

        {isLoading && <Loading fullScreen={false}/>}

        {data &&
            <Stack direction={compact ? "column" : "row"} sx={{flex: 1, minHeight: 0}}>
                <GuideSidebar sections={sections} activeSlug={effectiveActive} onSelect={scrollToSection}
                              compact={compact}/>
                <Box ref={scrollRef} sx={{flex: 1, minHeight: 0, overflowY: "auto", px: {xs: 2, sm: 4}, py: 2}}>
                    <Box sx={{mx: "auto", pb: 8}}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: (props) => <Typography color={"primary"} variant={"h3"}
                                                           sx={{mt: 2, mb: 2}} {...omitNode(props)}/>,
                                h2: ({children, ...props}) =>
                                    <Typography
                                        color={"primary"}
                                        variant={"h4"} id={slugify(nodeText(children))}
                                        sx={{mt: 5, mb: 2, scrollMarginTop: "1rem"}}
                                        {...omitNode(props)}>{children}</Typography>,
                                h3: (props) => <Typography variant={"h5"} sx={{mt: 3, mb: 1.5}} {...omitNode(props)}/>,
                                p: (props) => <Typography variant={"body1"} sx={{mb: 2}} {...omitNode(props)}/>,
                                li: (props) => <Typography component={"li"} variant={"body1"}
                                                           sx={{mb: 0.5}} {...omitNode(props)}/>,
                                table: (props) =>
                                    <Box sx={{overflowX: "auto", mb: 3}}><Table
                                        size={"small"} {...omitNode(props)}/></Box>,
                                thead: (props) => <TableHead {...omitNode(props)}/>,
                                tbody: (props) => <TableBody {...omitNode(props)}/>,
                                tr: (props) => <TableRow {...omitNode(props)}/>,
                                th: ({align, ...props}) =>
                                    <TableCell sx={{fontWeight: 600}} align={cellAlign(align)} {...omitNode(props)}/>,
                                td: ({align, ...props}) =>
                                    <TableCell align={cellAlign(align)} {...omitNode(props)}/>,
                                a: ({href, ...props}) =>
                                    <MuiLink href={href} target={href?.startsWith("http") ? "_blank" : undefined}
                                             rel={"noreferrer"} {...omitNode(props)}/>,
                                img: ({src, alt, title}) =>
                                    <Box component={"figure"} sx={{my: 3, mx: 0, textAlign: "center"}}>
                                        <Box component={"img"} src={typeof src === "string" ? src : undefined}
                                             alt={alt ?? ""}
                                             loading={"lazy"}
                                             sx={{
                                                 maxWidth: "100%",
                                                 height: "auto",
                                                 borderRadius: 1.5,
                                                 border: "1px solid",
                                                 borderColor: "divider"
                                             }}/>
                                        {title &&
                                            <Typography component={"figcaption"} variant={"caption"}
                                                        color={"text.secondary"}
                                                        sx={{display: "block", mt: 1}}>
                                                {title}
                                            </Typography>}
                                    </Box>,
                                pre: (props) => <Box component={"pre"} sx={{
                                    my: 2.5,
                                    p: 2,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    backgroundColor: (theme) => theme.palette.mode === "dark"
                                        ? "rgba(0, 0, 0, 0.35)" : "rgba(99, 51, 148, 0.05)",
                                    overflowX: "auto",
                                    fontSize: "0.82rem",
                                    lineHeight: 1.65,
                                    "& code": {
                                        fontFamily: "\"SFMono-Regular\", Menlo, Consolas, monospace",
                                        whiteSpace: "pre"
                                    }
                                }} {...omitNode(props)}/>,
                                code: ({children, className, ...props}) => {
                                    const isBlock = className?.includes("language-")
                                        || String(children).includes("\n")
                                    if (isBlock) {
                                        return <Box component={"code"} className={className}
                                                    sx={{fontFamily: "\"SFMono-Regular\", Menlo, Consolas, monospace"}}
                                                    {...omitNode(props)}>{children}</Box>
                                    }
                                    return <Box component={"code"} sx={{
                                        bgcolor: "action.hover",
                                        color: "primary.main",
                                        px: 0.6,
                                        py: 0.2,
                                        borderRadius: 0.75,
                                        fontFamily: "\"SFMono-Regular\", Menlo, Consolas, monospace",
                                        fontSize: "0.85em"
                                    }} {...omitNode(props)}>{children}</Box>
                                }
                            }}
                        >{data}</ReactMarkdown>
                    </Box>
                </Box>
            </Stack>
        }
    </Stack>

}
