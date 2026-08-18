import {useQueries} from "@tanstack/react-query";
import {useTranslation} from "react-i18next";
import type {GuideHit} from "../utils/guide-utils.ts";
import {GUIDE_CHAPTERS, MIN_SEARCH_LENGTH, searchGuide, splitChapter} from "../utils/guide-utils.ts";
import {chapterQuery} from "./use-guide-chapters.ts";

/**
 * Searches every chapter in the language being read, by heading and by prose.
 *
 * Nothing is fetched for this: the navigation tree already reads the same chapters, and a query's cache
 * entry holds the whole file, so both hooks share it and only differ in what they take from it. The
 * split is done through `select`, which means each chapter is divided once per file rather than once per
 * keystroke, leaving only the scan itself to repeat as the reader types.
 */
export function useGuideSearch(query: string): GuideHit[] {
    const {i18n, t} = useTranslation()
    const results = useQueries({
        queries: GUIDE_CHAPTERS.map(entry => ({...chapterQuery(entry.slug, i18n.language), select: splitChapter}))
    })

    if (query.trim().length < MIN_SEARCH_LENGTH) {
        return []
    }

    return searchGuide(GUIDE_CHAPTERS.map((entry, i) => ({
        slug: entry.slug,
        title: t(entry.titleKey),
        sections: results[i].data?.sections ?? []
    })), query)
}
