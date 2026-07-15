import {useTheme} from "@mui/material/styles";

const STAR_PATH = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

export function DesignGamesIllustration() {
    const {palette} = useTheme();
    return <svg viewBox="0 0 200 160" width="100%" height="100%" role="presentation">
        <g transform="rotate(15 30 30)">
            <path d="M14,12 L50,12 L50,48 Z" fill={palette.background.paper} fillOpacity="0.9"
                  stroke={palette.divider} strokeWidth="1.5"/>
            <path d="M18,44 L18,20 M22,44 L22,28 M26,44 L26,20" stroke={palette.divider} strokeWidth="1"/>
            <circle cx="46" cy="44" r="2" fill="none" stroke={palette.divider} strokeWidth="1"/>
        </g>
        <g transform="rotate(-4 100 80)">
            <path d="M76,140 A24,24 0 0 1 124,140 Z" fill={palette.warning.light} fillOpacity="0.85"
                  stroke={palette.divider} strokeWidth="1.5"/>
            <path d="M100,140 L100,117 M100,140 L82,128 M100,140 L118,128 M100,140 L91,119 M100,140 L109,119"
                  stroke={palette.divider} strokeWidth="1"/>
            <circle cx="100" cy="140" r="2" fill="none" stroke={palette.text.secondary} strokeWidth="1"/>
        </g>
        <g transform="rotate(-4 100 80)">
            <rect x="35" y="25" width="120" height="95" rx="10" fill={palette.background.paper}
                  stroke={palette.divider} strokeWidth="1.5"/>
            <path d="M95 45 60 80M95 45 120 78M120 78 138 108" stroke={palette.primary.main} strokeWidth="3"
                  fill="none" strokeLinecap="round"/>
            <circle cx="95" cy="45" r="9" fill={palette.primary.main} stroke={palette.background.paper}
                    strokeWidth="2"/>
            <path d="M92,42 L96,45 L92,48" stroke={palette.background.paper} strokeWidth="1.6" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="60" cy="80" r="8" fill={palette.primary.light} stroke={palette.background.paper}
                    strokeWidth="2"/>
            <path d="M60,76 L60,84 M56,80 L64,80" stroke={palette.background.paper} strokeWidth="1.6"
                  strokeLinecap="round"/>
            <circle cx="120" cy="78" r="8" fill={palette.warning.main} stroke={palette.background.paper}
                    strokeWidth="2"/>
            <g transform="translate(117 75.5) scale(0.25)">
                <path d={STAR_PATH} fill={palette.background.paper}/>
            </g>
            <circle cx="138" cy="108" r="7" fill={palette.success.main} stroke={palette.background.paper}
                    strokeWidth="2"/>
            <path d="M135,110 L138,105 L141,110" stroke={palette.background.paper} strokeWidth="1.6"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="55" y="100" width="18" height="4" rx="2" fill={palette.divider}/>
            <rect x="80" y="100" width="14" height="4" rx="2" fill={palette.divider}/>
        </g>
        <g transform="translate(140 8) scale(1.1)">
            <path d={STAR_PATH} fill={palette.warning.main}/>
        </g>
        <g transform="translate(12 108)">
            <rect width="28" height="9" rx="4.5" fill={palette.success.main}/>
            <rect y="13" width="19" height="9" rx="4.5" fill={palette.success.light}/>
        </g>
        <g transform="translate(168 110) rotate(38)">
            <rect x="-4" y="-9" width="8" height="7" rx="2" fill={palette.secondary.main}/>
            <rect x="-4" y="-2" width="8" height="3" fill={palette.divider}/>
            <rect x="-4" y="1" width="8" height="34" fill={palette.warning.main}/>
            <path d="M-4,35 L4,35 L0,45 Z" fill={palette.background.paper} stroke={palette.divider}
                  strokeWidth="1"/>
            <path d="M-1.3,41.5 L1.3,41.5 L0,45 Z" fill={palette.text.primary}/>
        </g>
    </svg>;
}

export function BuildRulesIllustration() {
    const {palette} = useTheme();
    return <svg viewBox="0 0 200 160" width="100%" height="100%" role="presentation">
        <rect x="15" y="18" width="78" height="28" rx="7" fill={palette.primary.main}/>
        <rect x="15" y="18" width="14" height="28" rx="7" fill={palette.primary.dark}/>
        <rect x="46" y="46" width="5" height="14" fill={palette.divider}/>
        <rect x="30" y="60" width="85" height="28" rx="7" fill={palette.warning.main}/>
        <rect x="30" y="60" width="14" height="28" rx="7" fill={palette.warning.dark}/>
        <rect x="65" y="88" width="5" height="14" fill={palette.divider}/>
        <rect x="45" y="102" width="75" height="24" rx="7" fill={palette.success.main}/>
        <rect x="45" y="102" width="14" height="24" rx="7" fill={palette.success.dark}/>

        <circle cx="98" cy="32" r="6" fill={palette.background.paper} stroke={palette.primary.dark}
                strokeWidth="2.2"/>
        <circle cx="120" cy="74" r="6" fill={palette.background.paper} stroke={palette.warning.dark}
                strokeWidth="2.2"/>
        <circle cx="125" cy="114" r="6" fill={palette.background.paper} stroke={palette.success.dark}
                strokeWidth="2.2"/>
        <line x1="104" y1="32" x2="138" y2="32" stroke={palette.primary.dark} strokeWidth="1.5"
              strokeDasharray="2,2"/>
        <line x1="126" y1="74" x2="138" y2="74" stroke={palette.warning.dark} strokeWidth="1.5"
              strokeDasharray="2,2"/>
        <line x1="131" y1="114" x2="138" y2="114" stroke={palette.success.dark} strokeWidth="1.5"
              strokeDasharray="2,2"/>

        <rect x="138" y="14" width="54" height="132" rx="6" fill={palette.background.paper}
              stroke={palette.divider} strokeWidth="1.5"/>
        <circle cx="146" cy="22" r="2" fill={palette.divider}/>
        <circle cx="153" cy="22" r="2" fill={palette.divider}/>
        <circle cx="160" cy="22" r="2" fill={palette.divider}/>
        <rect x="144" y="30" width="24" height="4" rx="2" fill={palette.primary.main}/>
        <rect x="150" y="38" width="34" height="4" rx="2" fill={palette.success.main}/>
        <rect x="144" y="46" width="18" height="4" rx="2" fill={palette.divider}/>
        <rect x="150" y="56" width="30" height="4" rx="2" fill={palette.warning.main}/>
        <rect x="144" y="64" width="40" height="4" rx="2" fill={palette.text.secondary}/>
        <rect x="150" y="74" width="22" height="4" rx="2" fill={palette.primary.light}/>
        <rect x="144" y="82" width="34" height="4" rx="2" fill={palette.success.light}/>
        <rect x="150" y="92" width="16" height="4" rx="2" fill={palette.divider}/>
        <rect x="144" y="102" width="28" height="4" rx="2" fill={palette.warning.light}/>
        <rect x="150" y="112" width="20" height="4" rx="2" fill={palette.primary.main}/>
        <rect x="144" y="122" width="36" height="4" rx="2" fill={palette.text.secondary}/>
    </svg>;
}

export function LaunchChallengesIllustration() {
    const {palette} = useTheme();
    return <svg viewBox="0 0 200 160" width="100%" height="100%" role="presentation">
        <ellipse cx="90" cy="140" rx="55" ry="14" fill={palette.success.light}/>
        <rect x="87" y="35" width="5" height="105" rx="2.5" fill={palette.primary.dark}/>
        <path d="M92 38H150L132 58 150 78H92Z" fill={palette.primary.main}/>
        <circle cx="42" cy="52" r="5" fill={palette.warning.main} stroke={palette.background.default}
                strokeWidth="1.5"/>
        <circle cx="33" cy="82" r="4" fill={palette.success.main} stroke={palette.background.default}
                strokeWidth="1.5"/>
        <rect x="152" y="95" width="10" height="10" rx="2" fill={palette.warning.light}
              stroke={palette.background.default} strokeWidth="1.5" transform="rotate(20 157 100)"/>
        <circle cx="167" cy="60" r="4" fill={palette.primary.light} stroke={palette.background.default}
                strokeWidth="1.5"/>
    </svg>;
}

export function LeaderboardIllustration() {
    const {palette} = useTheme();
    return <svg viewBox="0 0 200 160" width="100%" height="100%" role="presentation">
        <rect x="25" y="95" width="45" height="45" rx="6" fill={palette.primary.light}/>
        <rect x="77" y="60" width="45" height="80" rx="6" fill={palette.primary.main}/>
        <rect x="129" y="80" width="45" height="60" rx="6" fill={palette.primary.dark}/>
        <circle cx="47.5" cy="85" r="12" fill={palette.text.secondary} stroke={palette.background.paper}
                strokeWidth="2.5"/>
        <circle cx="99.5" cy="48" r="14" fill={palette.warning.main} stroke={palette.background.paper}
                strokeWidth="2.5"/>
        <circle cx="151.5" cy="68" r="12" fill={palette.success.main} stroke={palette.background.paper}
                strokeWidth="2.5"/>
        <g transform="translate(84 12) scale(0.9)">
            <path d={STAR_PATH} fill={palette.warning.main}/>
        </g>
    </svg>;
}

export function SafeTestingIllustration() {
    const {palette} = useTheme();
    return <svg viewBox="0 0 200 160" width="100%" height="100%" role="presentation">
        <rect x="40" y="130" width="110" height="8" rx="4" fill={palette.divider}/>
        <path d="M85 30H105M90 30V55L68 100A9 9 0 0076 113H114A9 9 0 00122 100L100 55V30"
              fill="none" stroke={palette.primary.main} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M75 88H115" stroke={palette.secondary.main} strokeWidth="10" strokeLinecap="round"/>
        <circle cx="95" cy="103" r="4" fill={palette.secondary.light}/>
        <circle cx="108" cy="110" r="3" fill={palette.secondary.light}/>
        <circle cx="82" cy="98" r="2.5" fill={palette.secondary.light}/>

        <path d="M90,30 L86,20 L104,20 L100,30 Z" fill={palette.secondary.main}/>
        <circle cx="95" cy="14" r="15" fill={palette.secondary.main}/>
        <circle cx="74" cy="17" r="11" fill={palette.secondary.main}/>
        <circle cx="116" cy="17" r="11" fill={palette.secondary.main}/>
        <circle cx="86" cy="4" r="10" fill={palette.secondary.main}/>
        <circle cx="106" cy="4" r="10" fill={palette.secondary.main}/>
        <circle cx="96" cy="1" r="7" fill={palette.secondary.main}/>
        <circle cx="88" cy="10" r="5" fill={palette.secondary.light} opacity="0.6"/>
        <circle cx="105" cy="9" r="4.5" fill={palette.secondary.light} opacity="0.55"/>
        <circle cx="72" cy="15" r="3.5" fill={palette.secondary.light} opacity="0.5"/>
        <circle cx="118" cy="15" r="3.5" fill={palette.secondary.light} opacity="0.5"/>
        <circle cx="55" cy="20" r="3" fill={palette.secondary.light}/>
        <circle cx="135" cy="18" r="3" fill={palette.secondary.light}/>

        <g transform="translate(132 88)">
            <circle r="16" fill={palette.warning.main} stroke={palette.background.paper} strokeWidth="2.5"/>
            <path d="M-7 0 -2 5 7 -5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
                  strokeLinejoin="round"/>
        </g>
        <circle cx="45" cy="60" r="6" fill={palette.text.secondary} stroke={palette.background.default}
                strokeWidth="1.5"/>

        <g transform="translate(164 32) rotate(6) scale(1.3)">
            <path d="M-25,2 Q0,18 25,2" fill="none" stroke={palette.text.secondary} strokeWidth="3"
                  strokeLinecap="round"/>
            <path d="M-19,-5 L-26,-2 L-26,5 L-19,5 Z" fill={palette.text.secondary}/>
            <path d="M19,-5 L26,-2 L26,5 L19,5 Z" fill={palette.text.secondary}/>
            <circle cx="-22.5" cy="-1" r="0.9" fill={palette.background.paper}/>
            <circle cx="-22.5" cy="2.5" r="0.9" fill={palette.background.paper}/>
            <circle cx="22.5" cy="-1" r="0.9" fill={palette.background.paper}/>
            <circle cx="22.5" cy="2.5" r="0.9" fill={palette.background.paper}/>
            <circle cx="-11" cy="0" r="9" fill={palette.background.paper} fillOpacity="0.8"
                    stroke={palette.text.secondary} strokeWidth="3"/>
            <circle cx="11" cy="0" r="9" fill={palette.background.paper} fillOpacity="0.8"
                    stroke={palette.text.secondary} strokeWidth="3"/>
            <rect x="-4" y="-2.5" width="8" height="5" rx="1.5" fill={palette.text.secondary}/>
        </g>

        <g transform="rotate(-6 42 34)">
            <rect x="14" y="10" width="56" height="48" rx="6" fill={palette.background.paper}
                  stroke={palette.divider} strokeWidth="1.5"/>
            <line x1="20" y1="52" x2="66" y2="52" stroke={palette.divider} strokeWidth="1"/>
            <rect x="20" y="44" width="6.5" height="8" fill={palette.primary.light}/>
            <rect x="26.5" y="38" width="6.5" height="14" fill={palette.primary.light}/>
            <rect x="33" y="32" width="6.5" height="20" fill={palette.primary.main}/>
            <rect x="39.5" y="24" width="6.5" height="28" fill={palette.warning.main}/>
            <rect x="46" y="30" width="6.5" height="22" fill={palette.primary.main}/>
            <rect x="52.5" y="38" width="6.5" height="14" fill={palette.primary.light}/>
            <rect x="59" y="44" width="6.5" height="8" fill={palette.primary.light}/>
            <line x1="42.75" y1="18" x2="42.75" y2="24" stroke={palette.warning.dark} strokeWidth="1.5"
                  strokeDasharray="2,2"/>
            <circle cx="42.75" cy="17" r="2.2" fill={palette.warning.dark}/>
        </g>
    </svg>;
}
