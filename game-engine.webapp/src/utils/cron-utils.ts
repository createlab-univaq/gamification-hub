import cronstrue from "cronstrue/i18n";

const range = (from: number, to: number) => Array.from({length: to - from + 1}, (_, i) => String(from + i))

// Suggestions rather than a closed set, since every part also accepts a list, a range or a step. The
// steps come first because they are what a schedule is usually built from. Duplicates are dropped: an
// option offered twice would be rendered twice under the same key.
const options = (...groups: string[][]) => [...new Set(groups.flat())]

export const CRON_PARTS = [
    {key: "minute", options: options(["*", "*/5", "*/10", "*/15", "*/30"], range(0, 59))},
    {key: "hour", options: options(["*", "*/2", "*/4", "*/6", "*/12"], range(0, 23))},
    {key: "day", options: options(["*", "*/2"], range(1, 31))},
    {key: "month", options: options(["*", "*/3", "*/6"], range(1, 12))},
    // Numbers rather than the three-letter names, which are English and would read as a foreign word in
    // the middle of an Italian form. Zero is Sunday, so the working week is 1-5 and the weekend 0,6.
    {key: "weekday", options: options(["*", "1-5", "0,6"], range(0, 6))}
] as const

// A cron expression is five parts separated by spaces. One that is missing parts is padded, so the parts
// always line up with what they mean.
export function toCronParts(value?: string): string[] {
    const parts = (value ?? "").trim().split(/\s+/).filter(Boolean)
    return CRON_PARTS.map((_, index) => parts[index] ?? "")
}

// A part left alone stands for "every", so an untouched one contributes a star rather than a gap: filling
// in only the hour still produces a complete expression.
export const toCronExpression = (parts: string[]) => parts.map(part => part.trim() || "*").join(" ")

// cronstrue is localised by language alone, so a region tag is dropped rather than passed on unmatched.
export const toCronLocale = (language?: string) => (language ?? "en").split("-")[0]

/** An empty expression is left for a required rule to complain about, so it does not count as invalid. */
export function isCronValid(value?: string): boolean {
    if (!value?.trim()) {
        return true
    }
    return describeCron(value) !== undefined
}

/** The expression said in words, or nothing at all when it cannot be read. */
export function describeCron(value?: string, language?: string): string | undefined {
    if (!value?.trim()) {
        return undefined
    }
    try {
        return cronstrue.toString(value, {locale: toCronLocale(language), throwExceptionOnParseError: true})
    } catch {
        return undefined
    }
}
