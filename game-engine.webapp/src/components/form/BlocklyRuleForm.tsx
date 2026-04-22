import {ReactElement, useEffect, useRef, useState} from 'react'
import type {PanelImperativeHandle} from 'react-resizable-panels'
import {Group, Panel} from 'react-resizable-panels'
import {Button, Stack} from '@mui/material'
import {ChevronLeft, ChevronRight, DragIndicator, FactCheck, Save, Terminal} from '@mui/icons-material'
import {DRLToMetaTransformer} from 'drools-builder'
import {PageContainer} from '../layout/PageContainer.tsx'
import {PageHeader} from '../layout/PageHeader.tsx'
import {BlocklyEditor} from '../blockly-builder/BlocklyEditor.tsx'
import {DroolEditor} from '../rule-builder/DroolEditor.tsx'
import {PanelSeparator} from '../PanelSeparator.tsx'
import {droolsFileToBlocklyState} from '../blockly-builder/drl-meta-to-blockly.ts'
import {useDebounced} from '../../hooks/use-debounced.ts'
import type {ConsoleMessage} from '../MessageConsole.tsx'
import {MessageConsole} from '../MessageConsole.tsx'
import type {WorkspaceSvg} from "blockly";
import type {Abstract} from "blockly/core/events/events_abstract";
import {generateDrlFromWorkspace} from "../blockly-builder/drl-generator.ts";
import type {RuleDto} from "../../api/types";
import {useMutation} from "@tanstack/react-query";
import {ruleClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {Loading} from "../Loading.tsx";

interface BlocklyRuleFormProps {
    title?: ReactElement,
    subTitle?: ReactElement
    rule?: RuleDto
    gameId: string
}

export function BlocklyRuleForm({rule, gameId, title, subTitle}: BlocklyRuleFormProps) {

    const [drl, setDrl] = useState('')
    const [blocklyState, setBlocklyState] = useState<object | undefined>()
    const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
    const builderPanelRef = useRef<PanelImperativeHandle>(null)
    const droolEditorPanelRef = useRef<PanelImperativeHandle>(null)
    const consolePanelRef = useRef<PanelImperativeHandle>(null)
    const {setNotification} = useNotificationContext()
    const [consoleActive, setConsoleActive] = useState(false)

    const {mutate: upsertRuleMutate, isPending: upsertRulePending} = useMutation({
        mutationFn: (request) => {
            pushMessage([{
                time: new Date(),
                type: "text",
                content: rule ? "Updating rule..." : "Creating rule...."
            }])
            if (rule) {

                return ruleClient.updateRule(rule.id, request)
            }
            return ruleClient.addRule(request)
        },
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/rules`, {
                state: {
                    type: "success",
                    title: `Rule saved`,
                    content: `The rule ${data.name} has been saved successfully.`
                }
            })
        },
        onError: handleErrors
    })

    const {mutate: validateMutation, isPending: validateIsPending, reset: validateReset} = useMutation({
        mutationFn: (request) => {
            pushMessage([{
                content: "Started validation...",
                time: new Date()
            }])
            return ruleClient.validateRule(request)
        },
        onSettled: (data) => {
            if (!Object.keys(data).length) {
                setNotification({
                    notification: {
                        type: "success",
                        content: "Rule was compiled successfully",
                        title: "Rule validation complete"
                    },
                    isSnack: true
                })
                pushMessage([{
                    content: "Validation completed successfully. No errors found.",
                    time: new Date(),
                    type: "info"
                }])
                return
            }
            const errors = Object.entries(data)
            pushMessage(errors.map(e => {
                return {
                    content: e[1],
                    type: "error",
                    time: new Date()
                } satisfies ConsoleMessage
            }))
        },
        onError: handleErrors
    })

    function handleErrors(errors) {
        console.error(errors)
        const apiError = getApiError(errors)
        if (apiError.details) {
            const detailsError = Object.values(apiError.details)
                .map(error => {
                    return {
                        type: "error",
                        content: error,
                        time: new Date()
                    } satisfies ConsoleMessage
                })
            pushMessage(detailsError)
        }
        setNotification({
            notification: translateApiErrorToNotification(apiError),
            isSnack: true
        })
    }

    const pushMessage = (messages: ConsoleMessage[]) => {
        if (consoleActive) {
            if (messages.length > 0 && consolePanelRef.current.isCollapsed()) {
                consolePanelRef.current.resize("40%")
            }
        }
        setConsoleMessages(messages)
    }

    const handleBuilderChange = useDebounced((workspace: WorkspaceSvg, event: Abstract) => {
        console.log("Builder Chainged", event.type, event.isUiEvent, event.recordUndo, event.group)
        if (!event.group || !event.recordUndo) {
            return
        }
        try {
            const drools = generateDrlFromWorkspace(workspace)
            console.log("Regenerated drool", drools)
            setDrl(drools)
        } catch (e) {
            pushMessage([{
                time: new Date(),
                type: 'warning',
                content: e instanceof Error ? e.message : String(e),
            }])
        }
    }, 400)

    const handleDrlChange = useDebounced((rawDrl: string) => {
        try {
            console.log("Changing DRL")
            const file = DRLToMetaTransformer.parse(rawDrl)
            setDrl(rawDrl)
            setBlocklyState(droolsFileToBlocklyState(file))
        } catch (e) {
            pushMessage([{
                time: new Date(),
                type: 'error',
                content: e instanceof Error ? e.message : String(e),
            }])
        }
    }, 400)

    const handleSave = () => {
        const drlFile = DRLToMetaTransformer.parse(drl)
        upsertRuleMutate({
            id: rule?.id,
            gameId: gameId,
            content: drl,
            name: drlFile.name
        } satisfies RuleDto)
    }

    useEffect(() => {
        if (rule) {
            handleDrlChange(rule.content)
        }
    }, [rule]);

    return (
        <PageContainer>
            {upsertRulePending && <Loading fullScreen={true}/>}
            <PageHeader
                title={title}
                subTitle={subTitle}
                buttons={
                    [
                        {
                            children: "Save",
                            variant: "contained",
                            disabled: validateIsPending || !drl.length || upsertRulePending,
                            endIcon: <Save/>,
                            onClick: handleSave
                        },
                        {
                            children: "Validate",
                            variant: "contained",
                            disabled: validateIsPending || !drl.length || upsertRulePending,
                            endIcon: <FactCheck/>,
                            onClick: () => {
                                validateReset()
                                const tmpRule = {
                                    content: drl,
                                    name: "validation-test-rule",
                                    gameId: gameId
                                } satisfies RuleDto
                                validateMutation(tmpRule)
                            }
                        },
                        {
                            children: "Console",
                            variant: consoleActive ? "contained" : "outlined",
                            endIcon: <Terminal/>,
                            onClick: () => {
                                setConsoleActive(!consoleActive)
                            }
                        }
                    ]}
            />
            <Group orientation={"horizontal"}
                   style={{display: "flex", gap: "1.5rem", width: "100%", height: "80dvh", marginTop: "0.5rem"}}>
                {/* ── Left: Blockly + Console ───────────────────────────── */}
                <Panel collapsible={true} minSize={"10%"} maxSize={"100%"} panelRef={builderPanelRef}>
                    <Group orientation={"vertical"} style={{display: "flex", gap: "1.5rem", height: "100%"}}>

                        <Panel collapsible={true} defaultSize={"75%"} minSize={"10%"}>
                            <BlocklyEditor
                                onChange={handleBuilderChange}
                                initialState={blocklyState}
                            />
                        </Panel>

                        {consoleActive &&
                            <>
                                {/* Vertical separator (controls console) */}
                                <PanelSeparator
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        "&:hover > .MuiStack-root": {opacity: "1"}
                                    }}
                                >
                                    <Stack
                                        direction={"row"}
                                        sx={{
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "opacity ease-in-out 0.2s",
                                            opacity: "0",
                                            gap: 1,
                                            width: "fit-content",
                                        }}
                                    >
                                        <Button
                                            sx={{padding: 0, minWidth: 0, width: "min-content"}}
                                            onClick={() => consolePanelRef.current.collapse()}
                                            variant={"contained"}
                                        >
                                            <ChevronLeft sx={{
                                                transform: "rotate(-90deg)",
                                                width: "1.5rem",
                                                height: "1.5rem"
                                            }}/>
                                        </Button>
                                        <Button
                                            sx={{padding: 0, minWidth: 0, width: "min-content"}}
                                            variant={"contained"}
                                        >
                                            <DragIndicator sx={{
                                                transform: "rotate(90deg)",
                                                width: "1.5rem",
                                                height: "1.5rem"
                                            }}/>
                                        </Button>
                                        <Button
                                            sx={{padding: 0, minWidth: 0, width: "min-content"}}
                                            onClick={() => {
                                                if (consolePanelRef.current.isCollapsed()) {
                                                    consolePanelRef.current.expand()
                                                    return
                                                }
                                                consolePanelRef.current.resize("100%")
                                            }}
                                            variant={"contained"}
                                        >
                                            <ChevronRight sx={{
                                                transform: "rotate(-90deg)",
                                                width: "1.5rem",
                                                height: "1.5rem"
                                            }}/>
                                        </Button>
                                    </Stack>
                                </PanelSeparator>
                                <Panel defaultSize={0} collapsible={true} panelRef={consolePanelRef}>
                                    <MessageConsole
                                        messages={consoleMessages}
                                        onClear={() => setConsoleMessages([])}
                                    />
                                </Panel>
                            </>
                        }
                    </Group>
                </Panel>

                {/* Horizontal separator (controls builder / drool editor) */}
                <PanelSeparator
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover > .MuiStack-root": {opacity: "1"}
                    }}
                >
                    <Stack
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "opacity ease-in-out 0.2s",
                            opacity: "0",
                            gap: 1,
                            position: 'sticky',
                            top: '30dvh',
                        }}
                    >
                        <Button
                            sx={{padding: 0, minWidth: 0, width: "min-content"}}
                            onClick={() => builderPanelRef.current.collapse()}
                            variant={"contained"}
                        >
                            <ChevronLeft sx={{
                                width: "1.5rem",
                                height: "1.5rem"
                            }}/>
                        </Button>
                        <Button
                            sx={{padding: 0, minWidth: 0, width: "min-content"}}
                            variant={"contained"}
                        >
                            <DragIndicator sx={{
                                width: "1.5rem",
                                height: "1.5rem"
                            }}/>
                        </Button>
                        <Button
                            sx={{padding: 0, minWidth: 0, width: "min-content"}}
                            onClick={() => droolEditorPanelRef.current.collapse()}
                            variant={"contained"}
                        >
                            <ChevronRight sx={{
                                width: "1.5rem",
                                height: "1.5rem"
                            }}/>
                        </Button>
                    </Stack>
                </PanelSeparator>

                {/* ── Right: DRL Editor ─────────────────────────────────── */}
                <Panel collapsible={true} defaultSize={"30%"} minSize={"10%"} panelRef={droolEditorPanelRef}>
                    <DroolEditor
                        drl={drl}
                        readonly={false}
                        onChange={handleDrlChange}
                        sx={{width: '100%', height: '80dvh'}}
                    />
                </Panel>

            </Group>
        </PageContainer>
    )
}
