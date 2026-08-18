import {useQueries, useQuery} from "@tanstack/react-query";
import {useTranslation} from "react-i18next";
import {docsClient} from "../api";
import type {Language} from "../utils/lng-utils.ts";
import type {GuideChapter} from "../utils/guide-utils.ts";
import {GUIDE_CHAPTERS, readSections} from "../utils/guide-utils.ts";

// A chapter with no file in the interface language is read in English rather than failing, which is
// what lets a chapter ship in one language ahead of the other.
function languageFor(slug: string, uiLanguage: string): Language {
    const chapter = GUIDE_CHAPTERS.find(entry => entry.slug === slug)
    const available = (chapter?.languages ?? ["en"]) as readonly string[]
    return (available.includes(uiLanguage) ? uiLanguage : "en") as Language
}

/** Shared so every reader of a chapter hits the same cache entry, whatever it does with the text. */
export function chapterQuery(slug: string, uiLanguage: string) {
    const language = languageFor(slug, uiLanguage)
    return {
        queryKey: ["guide-chapter", slug, language],
        queryFn: () => docsClient.getGuideChapter(slug, language),
        staleTime: Infinity
    }
}

/**
 * The navigation tree: every chapter with its sections. Used by the layout.
 *
 * The headings are read through `select`, so a chapter is scanned when its file arrives rather than on
 * every render. The tree is rebuilt for two components on every navigation, and scanning each chapter
 * again each time was most of the delay in moving between them.
 */
export function useGuideChapters(): GuideChapter[] {
    const {i18n, t} = useTranslation()
    const results = useQueries({
        queries: GUIDE_CHAPTERS.map(entry => ({...chapterQuery(entry.slug, i18n.language), select: readSections}))
    })

    return GUIDE_CHAPTERS.map((entry, i) => ({
        slug: entry.slug,
        title: t(entry.titleKey),
        icon: entry.icon,
        sections: results[i].data ?? []
    }))
}

/** One chapter's markdown. Shares the cache with the tree above, so nothing is fetched twice. */
export function useGuideChapter(slug: string) {
    const {i18n} = useTranslation()
    return useQuery(chapterQuery(slug, i18n.language))
}
