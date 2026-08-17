import {useCallback, useRef} from "react";
import {useBeforeUnload, useBlocker} from "react-router-dom";

/**
 * Warns before leaving a page that holds unsaved work.
 *
 * In-app navigation is stopped through the router: react-router drives history with pushState, which
 * is not an interceptable navigation, so a `navigate` listener cannot cancel it. Leaving the site
 * altogether (tab close, reload, external link) is not a router navigation at all and only the
 * browser's own beforeunload prompt can cover it.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
    // Read synchronously by the blocker, so a save can wave a navigation through in the same tick it
    // triggers the redirect, before the dirty state has had a chance to settle.
    const bypass = useRef(false)

    const blocker = useBlocker(useCallback(
        ({currentLocation, nextLocation}) => {
            if (bypass.current) {
                return false
            }
            return isDirty && currentLocation.pathname !== nextLocation.pathname
        },
        [isDirty]))

    useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
        if (isDirty && !bypass.current) {
            event.preventDefault()
        }
    }, [isDirty]))

    return {
        isBlocked: blocker.state === "blocked",
        confirmLeave: () => blocker.proceed?.(),
        cancelLeave: () => blocker.reset?.(),
        // Call before navigating away deliberately, e.g. right after a successful save.
        allowNextNavigation: () => {
            bypass.current = true
        }
    }
}
