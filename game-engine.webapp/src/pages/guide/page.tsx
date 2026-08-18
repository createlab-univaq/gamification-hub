import type {Components} from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {useMemo} from "react";
import {
    Box,
    Divider,
    Link as MuiLink,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Navigate, useParams} from "react-router-dom";
import {Loading} from "../../components/Loading.tsx";
import {RouterLink} from "../../components/RouterLink.tsx";
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useGuideChapter, useGuideChapters} from "../../hooks/use-guide-chapters.ts";
import {
    DEFAULT_GUIDE_CHAPTER,
    guideChapterPath,
    guideTrail,
    isGuideChapter,
    slugifyHeading,
    splitChapter
} from "../../utils/guide-utils.ts";
import {GuideNavigation} from "../../components/guide/GuideNavigation.tsx";

function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
    const rest: Record<string, unknown> = {...props}
    delete rest.node
    return rest as Omit<T, "node">
}

// An image on its own line still arrives wrapped in a paragraph, and the img renderer turns it into
// a figure. A figure cannot live inside a <p>, so those paragraphs render as a plain box instead.
function isImageParagraph(node?: unknown) {
    const children = (node as { children?: { type: string, tagName?: string, value?: string }[] })?.children ?? []
    return children.length > 0 && children.every(child =>
        (child.type === "element" && child.tagName === "img")
        || (child.type === "text" && (child.value ?? "").trim() === ""))
}

function cellAlign(align?: string | null) {
    return align === "left" || align === "right" || align === "center" ? align : undefined
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

const REMARK_PLUGINS = [remarkGfm]

// Defined once rather than per render: nothing here depends on the page, and a fresh object would make
// the memo above rebuild every time.
const MARKDOWN_COMPONENTS: Components = {
    h1: (props) => <Typography color={"primary"} variant={"h3"}
                               sx={{mt: 2, mb: 2}} {...omitNode(props)}/>,
    h2: ({children, ...props}) =>
        <Typography
            color={"primary"}
            variant={"h3"} id={slugifyHeading(nodeText(children))}
            sx={{mt: 2, mb: 2, scrollMarginTop: "1rem"}}
            {...omitNode(props)}>{children}</Typography>,
    h3: (props) => <Typography variant={"h5"} sx={{mt: 3, mb: 1.5}} {...omitNode(props)}/>,
    p: (props) => isImageParagraph(props.node)
        ? <Box {...omitNode(props)}/>
        : <Typography variant={"body1"} sx={{mb: 2}} {...omitNode(props)}/>,
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
    // A link from one chapter to another is routed rather than followed, so crossing the
    // guide costs no reload, and it replaces its entry exactly as the navigation tree
    // does, which keeps one step back on the page the guide was opened from.
    a: ({href, ...props}) => {
        if (href?.startsWith("/guide")) {
            return <MuiLink component={RouterLink} href={href}
                            replace={true} {...omitNode(props)}/>
        }
        // Anything that leaves the console opens beside it rather than replacing it, so a
        // reference followed from the guide never costs the reader their place. A bare
        // fragment is left to the browser, which already scrolls to it.
        const leavesTheApp = !!href && (href.startsWith("http") || href.startsWith("/"))
        return <MuiLink href={href} target={leavesTheApp ? "_blank" : undefined}
                        rel={"noreferrer"} {...omitNode(props)}/>
    },
    img: ({src, alt, title}) =>
        <Box component={"figure"} sx={{my: 3, mx: 0, textAlign: "center"}}>
            {/* A screenshot illustrates the prose rather than replacing it, so it is bounded on both
                axes: the width of the section it sits in, and a share of the window's height. Both
                dimensions stay automatic so the picture scales inside whichever bound it meets first. */}
            <Box component={"img"} src={typeof src === "string" ? src : undefined}
                 alt={alt ?? ""}
                 loading={"lazy"}
                 sx={{
                     display: "block",
                     mx: "auto",
                     width: "auto",
                     height: "auto",
                     maxWidth: "100%",
                     maxHeight: {xs: "45vh", md: "60vh"},
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
}

// Renders one page of the guide: a section of a chapter, or the chapter's own opening when no section
// is named. The navigation tree belongs to GuideLayout, so this is the document and its two steps.
export function GuidePage() {
    const user = getCurrentUser()
    const {chapter, section} = useParams()
    const activeChapter = isGuideChapter(chapter) ? chapter : DEFAULT_GUIDE_CHAPTER
    const {data, isLoading, error} = useGuideChapter(activeChapter)
    const chapters = useGuideChapters()

    const {intro, sections} = useMemo(() => splitChapter(data), [data])
    const current = section ? sections.find(entry => entry.id === section) : undefined
    const body = current ? current.body : intro
    // react-markdown parses inside its own render and memoises nothing, so the finished element is kept
    // and rebuilt only when the prose changes. Otherwise every unrelated render, a window resize or the
    // navigation drawer opening, parses the whole section again.
    const rendered = useMemo(() => <ReactMarkdown remarkPlugins={REMARK_PLUGINS}
                                                  components={MARKDOWN_COMPONENTS}>{body}</ReactMarkdown>, [body])
    const trail = guideTrail(chapters)
    const at = trail.findIndex(stop =>
        stop.chapterSlug === activeChapter && stop.sectionId === (section ?? null))

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={user ? "/dashboard" : "/login"} replace={true} state={errorMessage}/>
    }

    if (isLoading) {
        return <Loading fullScreen={false}/>
    }

    // Only a number out of range gets here, since the address does not depend on the language: a
    // section that exists is found whichever language the chapter is being read in.
    if (section && !current) {
        return <Navigate to={guideChapterPath(activeChapter)} replace={true}/>
    }

    return <>
        {rendered}
        <Divider sx={{my: 2}}/>
        <GuideNavigation
            chapterSlug={activeChapter}
            previous={at > 0 ? trail[at - 1] : undefined}
            next={at >= 0 && at < trail.length - 1 ? trail[at + 1] : undefined}
        />
    </>
}
