import "../../blockly-override-style.css"
import {useEffect, useRef} from 'react'
import type {WorkspaceSvg} from 'blockly'
import * as Blockly from 'blockly'
import {registerBlockDefinitions} from './blocks-definition.ts'
import {TOOLBOX} from './toolbox'
import {useThemeProvider} from '../../theme/ThemeProvider'
import {useTheme} from "@mui/material";
import type {Abstract} from "blockly/core/events/events_abstract";
import {blocklyDarkTheme, blocklyLightTheme} from "../../theme/blockly-theme.ts";
import {registerFields} from "./fields";


const BLOCKLY_CONTAINER_ID = 'blockly-editor-root'

interface BlocklyEditorProps {
    onChange?: (workspace: WorkspaceSvg, event?: Abstract) => void
    initialState?: object
}

export function BlocklyEditor({onChange, initialState}: BlocklyEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const workspaceRef = useRef<WorkspaceSvg | null>(null)
    const {mode} = useThemeProvider()
    const theme = useTheme()

    // ── Mount: inject workspace once ──────────────────────────────────────────
    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }
        registerFields()
        registerBlockDefinitions()
        const workspace = Blockly.inject(container, {
            toolbox: TOOLBOX,
            renderer: "zelos",
            theme: mode === 'dark' ? blocklyDarkTheme : blocklyLightTheme,
            grid: {spacing: 25, length: 5, colour: theme.palette.primary.main, snap: true},
            zoom: {
                pinch: true,
                controls: true,
                wheel: true,
                startScale: 0.7,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
            },
            trashcan: true,
            move: {
                drag: true,
                wheel: true,
            },
        })
        workspaceRef.current = workspace

        workspace.addChangeListener((event) => {
            onChange?.(workspace, event)
        })

        const observer = new ResizeObserver(() => Blockly.svgResize(workspace))
        observer.observe(container)

        if (initialState) {
            try {
                Blockly.serialization.workspaces.load(initialState, workspace, {recordUndo: false})
            } catch (e) {
                console.warn('[BlocklyEditor] Could not load initial state:', e)
            }
        }


        return () => {
            observer.disconnect()
            workspace.dispose()
            workspaceRef.current = null
        }
    }, [])

    // ── Sync MUI theme → Blockly theme
    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }
        workspaceRef.current?.setTheme(mode === 'dark' ? blocklyDarkTheme : blocklyLightTheme)
    }, [mode])

    // ── Reload external state ─────────────────────────────────────────────────
    // recordUndo: false ensures events from this load are ignored by the change
    // listener, preventing the DRL→Blockly→DRL feedback loop.
    useEffect(() => {
        const workspace = workspaceRef.current
        if (!workspace || !initialState) {
            return
        }
        try {
            Blockly.serialization.workspaces.load(initialState, workspace, {recordUndo: false})
        } catch (e) {
            console.warn('[BlocklyEditor] Could not reload state:', e)
        }
    }, [initialState])

    return (
        <div
            id={BLOCKLY_CONTAINER_ID}
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}
        />
    )
}
