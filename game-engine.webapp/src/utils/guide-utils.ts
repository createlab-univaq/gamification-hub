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
