import * as Blockly from 'blockly'
import {lightTheme} from "./light-theme.ts";
import {darkTheme} from "./dark-theme.ts";

// ─── Light theme — matches lightTheme palette ─────────────────────────────────
// primary.main #1A56DB, background.default #F7F9FC, paper #FFFFFF

export const blocklyLightTheme = Blockly.Theme.defineTheme('gamification-light', {
    name: 'gamification-light',
    base: Blockly.Themes.Zelos,
    componentStyles: {
        workspaceBackgroundColour: lightTheme.palette.background.default
    },
    startHats: true
})

// ─── Dark theme — matches darkTheme palette ───────────────────────────────────
// primary.main #3B82F6, background.default #0F172A, paper #1E293B

export const blocklyDarkTheme = Blockly.Theme.defineTheme('gamification-dark', {
    name: 'gamification-dark',
    base: Blockly.Themes.Zelos,
    componentStyles: {
        workspaceBackgroundColour: darkTheme.palette.background.default
    },
    startHats: true
})
