import {useTheme} from "@mui/material/styles";

export function HighlightsBackground() {
    const {palette} = useTheme();
    return <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation"
                style={{position: "absolute", inset: 0}}>
        <defs>
            <filter id="highlights-bg-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4"/>
            </filter>
        </defs>
        <g filter="url(#highlights-bg-blur)">
            <circle cx="12" cy="6" r="16" fill={palette.primary.main} opacity="0.14"/>
            <circle cx="88" cy="16" r="13" fill={palette.success.main} opacity="0.12"/>
            <circle cx="18" cy="32" r="15" fill={palette.warning.main} opacity="0.13"/>
            <circle cx="82" cy="45" r="14" fill={palette.primary.main} opacity="0.12"/>
            <circle cx="15" cy="60" r="16" fill={palette.success.main} opacity="0.13"/>
            <circle cx="85" cy="72" r="13" fill={palette.warning.main} opacity="0.12"/>
            <circle cx="20" cy="86" r="15" fill={palette.primary.main} opacity="0.13"/>
            <circle cx="80" cy="96" r="12" fill={palette.success.main} opacity="0.12"/>
        </g>
    </svg>;
}
