import { useCallback, useRef } from 'react'

/**
 * Returns a debounced version of the provided function.
 * Calling the returned function multiple times resets the timer each time —
 * the original function only runs once the timeout elapses without another call.
 *
 * @param fn      The function to debounce.
 * @param timeout Delay in milliseconds.
 */
export function useDebounced<T extends (...args: never[]) => void>(fn: T, timeout: number): T {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    return useCallback((...args: Parameters<T>) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => fn(...args), timeout)
    }, [fn, timeout]) as T
}
