export function formatDate(date:string | number | Date) {
    return new Date(date).toLocaleDateString("it-IT")
}

export function formatTime(date:string | number | Date) {
    return new Date(date).toLocaleTimeString("it-IT")
}

type TimeFormat = "seconds" | "minutes" | "hours" | "days"

const MILLISECONDS_TO_TIME_RECORD = {
    days:86400000,
    hours:3600000,
    minutes:60000,
    seconds:1000
} satisfies Record<TimeFormat, number>

export function convertMilliseconds(time:number, format:TimeFormat="seconds") {
    const base = MILLISECONDS_TO_TIME_RECORD[format]
    if (!base) {
        return 0
    }
    return time / base
}

export function formatMilliseconds(time:number) {
    if(time >= MILLISECONDS_TO_TIME_RECORD["days"]) {
        return `${convertMilliseconds(time, "days")} giorni`
    }
    if(time >= MILLISECONDS_TO_TIME_RECORD["hours"]) {
        return `${convertMilliseconds(time, "hours")} ore`
    }
    if(time >= MILLISECONDS_TO_TIME_RECORD["minutes"]) {
        return `${convertMilliseconds(time, "minutes")} minuti`
    }
    return `${convertMilliseconds(time, "seconds")} secondi`
}