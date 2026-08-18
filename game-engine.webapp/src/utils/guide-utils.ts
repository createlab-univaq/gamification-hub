// Slugs are part of the URL, so they stay in English and never change with the interface language.
// Titles come from i18n. A chapter with no localised file falls back to English rather than 404ing,

import {Construction, DeviceHub, ImportantDevices, type SvgIconComponent} from "@mui/icons-material"

// which is what lets a chapter ship in one language ahead of the other.
export const GUIDE_CHAPTERS = [
    {slug: "console", titleKey: "guide.chapters.console", languages: ["en", "it"], icon: ImportantDevices},
    {slug: "builder", titleKey: "guide.chapters.builder", languages: ["en", "it"], icon: Construction},
    {slug: "api", titleKey: "guide.chapters.api", languages: ["en", "it"], icon: DeviceHub},
] as const

export type GuideChapterSlug = typeof GUIDE_CHAPTERS[number]["slug"]

export const DEFAULT_GUIDE_CHAPTER: GuideChapterSlug = "console"

export interface GuideSection {
    // The section's place in its chapter, counting from one. This is what addresses it, because a slug
    // made from the heading changes with the interface language and a number does not.
    id: string
    slug: string
    title: string
}

export interface GuideChapter {
    slug: string
    title: string
    icon: SvgIconComponent
    sections: GuideSection[]
}

export function isGuideChapter(slug?: string): slug is GuideChapterSlug {
    return GUIDE_CHAPTERS.some(chapter => chapter.slug === slug)
}

export function guideChapterPath(slug: string) {
    return `/guide/${slug}`
}

// A section is a page of its own, so a link to one part of a chapter can be shared and reopened. It is
// addressed by number, which means the same link works whatever language the reader is in.
export function guideSectionPath(chapterSlug: string, sectionId: string) {
    return `${guideChapterPath(chapterSlug)}/${sectionId}`
}

// The text a rendered node holds, whatever it is nested in. Headings use it to build their anchor and a
// code block to know what to put on the clipboard.
export function nodeText(children: unknown): string {
    if (children == null || children === false) return ""
    if (typeof children === "string" || typeof children === "number") return String(children)
    if (Array.isArray(children)) return children.map(nodeText).join("")
    if (typeof children === "object" && "props" in children) {
        return nodeText((children as { props: { children?: unknown } }).props.children)
    }
    return ""
}

export function slugifyHeading(text: string): string {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export interface GuideSectionContent extends GuideSection {
    body: string
}

// Shared so the navigation tree and the pages can never disagree on where a section begins.
const SECTION_HEADING = /^##\s+(.*)$/

// Split on either ending: a file added on Windows carries \r\n, and a stray \r counts as a line
// terminator in a pattern, so a heading would never be recognised at the end of its line.
const LINE_BREAK = /\r?\n/

// A chapter is one file, and its level-two headings are what divides it into pages. Everything above
// the first heading is the chapter's own opening, which becomes the page the chapter itself shows.
export function splitChapter(markdown?: string): { intro: string, sections: GuideSectionContent[] } {
    if (!markdown) {
        return {intro: "", sections: []}
    }
    const intro: string[] = []
    const sections: GuideSectionContent[] = []
    for (const line of markdown.split(LINE_BREAK)) {
        const heading = SECTION_HEADING.exec(line)
        if (heading) {
            const title = heading[1].trim()
            sections.push({id: String(sections.length + 1), title, slug: slugifyHeading(title), body: line})
            continue
        }
        if (sections.length === 0) {
            intro.push(line)
        } else {
            sections[sections.length - 1].body += `\n${line}`
        }
    }
    // The rule that closed the opening separated it from the first section, which is now a page break.
    return {intro: intro.join("\n").trim().replace(/\n*-{3,}$/, "").trim(), sections}
}

// The navigation tree wants titles and nothing else, so it reads the headings rather than splitting
// the chapter up: building every section's prose only to discard it is the whole file's work wasted.
export function readSections(markdown?: string): GuideSection[] {
    if (!markdown) {
        return []
    }
    const sections: GuideSection[] = []
    for (const line of markdown.split(LINE_BREAK)) {
        const heading = SECTION_HEADING.exec(line)
        if (heading) {
            const title = heading[1].trim()
            sections.push({id: String(sections.length + 1), title, slug: slugifyHeading(title)})
        }
    }
    return sections
}

// Accents are folded and case is dropped, so searching "perche" finds "perché" and "Salience" finds
// "salience". Folding a precomposed letter leaves one character behind, so positions still line up
// with the text being displayed.
function fold(text: string) {
    return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

// Snippets are read as prose, so the markup around the words goes: table pipes, heading marks, emphasis,
// fences and the link syntax, which keeps its text and drops its address.
function asProse(markdown: string) {
    return markdown
        .replace(/```[^\n]*/g, " ")
        .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
        .replace(/[`*_>#|]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

export interface TextSegment {
    text: string
    match: boolean
}

// Cuts a piece of text into the parts that matched and the parts that did not, so a result can show
// where the words were found. Matching happens on the folded text and the pieces are taken from the
// original, which keeps the accents and the capitals the reader wrote.
export function splitHighlights(text: string, query: string): TextSegment[] {
    const needle = fold(query.trim())
    if (needle.length < MIN_SEARCH_LENGTH) {
        return [{text, match: false}]
    }
    const haystack = fold(text)
    const segments: TextSegment[] = []
    let from = 0
    for (let at = haystack.indexOf(needle); at >= 0; at = haystack.indexOf(needle, from)) {
        if (at > from) {
            segments.push({text: text.slice(from, at), match: false})
        }
        segments.push({text: text.slice(at, at + needle.length), match: true})
        from = at + needle.length
    }
    if (from < text.length) {
        segments.push({text: text.slice(from), match: false})
    }
    return segments
}

export interface GuideHit {
    chapterSlug: string
    chapterTitle: string
    sectionId: string
    title: string
    path: string
    snippet: string
}

export interface SearchableChapter {
    slug: string
    title: string
    sections: GuideSectionContent[]
}

const SNIPPET_BEFORE = 40
const SNIPPET_LENGTH = 160
export const MIN_SEARCH_LENGTH = 2

// A section matches on its heading or anywhere in its prose. The snippet is cut around the first match
// so the reader can see why a section came up rather than having to open it to find out.
export function searchGuide(chapters: SearchableChapter[], query: string, limit = 40): GuideHit[] {
    const needle = fold(query.trim())
    if (needle.length < MIN_SEARCH_LENGTH) {
        return []
    }
    const hits: GuideHit[] = []
    for (const chapter of chapters) {
        for (const section of chapter.sections) {
            const prose = asProse(section.body)
            const at = fold(prose).indexOf(needle)
            const inTitle = fold(section.title).includes(needle)
            if (at < 0 && !inTitle) {
                continue
            }
            const from = at < 0 ? 0 : Math.max(0, at - SNIPPET_BEFORE)
            const snippet = prose.slice(from, from + SNIPPET_LENGTH).trim()
            hits.push({
                chapterSlug: chapter.slug,
                chapterTitle: chapter.title,
                sectionId: section.id,
                title: section.title,
                path: guideSectionPath(chapter.slug, section.id),
                snippet: `${from > 0 ? "… " : ""}${snippet}${from + SNIPPET_LENGTH < prose.length ? " …" : ""}`
            })
            if (hits.length >= limit) {
                return hits
            }
        }
    }
    return hits
}

export interface GuideStop {
    chapterSlug: string
    chapterTitle: string
    sectionId: string | null
    title: string
    path: string
}

// Every page of the guide in reading order, chapter openings included, so that moving on from the
// last section of a chapter continues into the next one rather than stopping.
export function guideTrail(chapters: GuideChapter[]): GuideStop[] {
    return chapters.flatMap(chapter => [
        {
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            sectionId: null,
            title: chapter.title,
            path: guideChapterPath(chapter.slug)
        },
        ...chapter.sections.map(section => ({
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            sectionId: section.id,
            title: section.title,
            path: guideSectionPath(chapter.slug, section.id)
        }))
    ])
}
