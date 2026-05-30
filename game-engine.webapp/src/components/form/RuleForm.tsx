import type {RuleDto} from "../../api/types";
import {RuleBuilder} from "../rule-builder/RuleBuilder.tsx";
import type {DroolsFile} from "drools-builder"
import {DRLToMetaTransformer, MetaToDRLTransformer} from "drools-builder";
import {useMutation} from "@tanstack/react-query";
import {ruleClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {useEffect, useRef, useState} from "react";
import {Loading} from "../Loading.tsx";
import {DroolEditor} from "../rule-builder/DroolEditor.tsx";
import {Button, ButtonGroup, Stack, Typography} from "@mui/material";
import {ChevronLeft, ChevronRight, DragIndicator, Edit, FactCheck, Stop} from "@mui/icons-material";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {PanelSeparator} from "../PanelSeparator.tsx";

import type {PanelImperativeHandle} from "react-resizable-panels";
import {Group, Panel} from "react-resizable-panels";
import type {ConsoleMessage} from "../MessageConsole.tsx";
import {MessageConsole} from "../MessageConsole.tsx";

interface RuleFormProps {
    rule?: RuleDto
    gameId: string
}

export function RuleForm({rule, gameId}: RuleFormProps) {

    const [initialRule, setInitialRule] = useState(rule ? DRLToMetaTransformer.parse(rule.content) : undefined)
    const [initialDrlPreview, setInitialDrlPreview] = useState(rule?.content ?? "")
    const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
    const [drlContent, setDrlContent] = useState(initialDrlPreview)
    const [readonly, setReadonly] = useState(true)
    const {setNotification} = useNotificationContext()
    const builderPanelRef = useRef<PanelImperativeHandle>()
    const droolEditorPanelRef = useRef<PanelImperativeHandle>()
    const consolePanelRef = useRef<PanelImperativeHandle>()

    const {mutate: upsertRuleMutate, isPending: upsertRulePending} = useMutation({
        mutationFn: (request) => {
            setConsoleMessages([...consoleMessages, {
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
            setConsoleMessages([{
                content: "Started validation...",
                time: new Date()
            }])
            return ruleClient.validateRule(request)
        },
        onSettled: (data) => {
            const entries = Object.entries(data)
            if (!entries.length) {
                setNotification({
                    notification: {
                        type: "success",
                        content: "Rule was compiled successfully",
                        title: "Rule validation complete"
                    },
                    isSnack: true
                })
                return
            }
            const warnings = entries.filter(([k]) => k.startsWith("_warning"))
            const errors = entries.filter(([k]) => !k.startsWith("_warning"))
            updateConsoleMessages([
                ...warnings.map(([, v]) => ({
                    content: v,
                    type: "warning",
                    time: new Date()
                } satisfies ConsoleMessage)),
                ...errors.map(([, v]) => ({
                    content: v,
                    type: "error",
                    time: new Date()
                } satisfies ConsoleMessage)),
            ])
            if (errors.length) {
                setNotification({
                    notification: {
                        type: "error",
                        content: <Stack>{errors.map((e, index) => <Typography
                            key={`notification-detail-${index}`}>{e[0]}: {e[1]}</Typography>)}</Stack>,
                        title: "Rule validation failed",
                    },
                    isSnack: true
                })
            } else {
                setNotification({
                    notification: {
                        type: "warning",
                        content: "Rule compiled with warnings — see console for details.",
                        title: "Partial validation",
                    },
                    isSnack: true
                })
            }
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
            updateConsoleMessages(detailsError)
        }
        setNotification({
            notification: translateApiErrorToNotification(apiError),
            isSnack: true
        })
    }

    function updateConsoleMessages(messages: ConsoleMessage[]) {
        if (messages.length > 0 && consolePanelRef.current?.isCollapsed()) {
            consolePanelRef.current.expand(40)
        }
        setConsoleMessages(messages)
    }

    const regenerateDrl = useDebounced((nextFile: DroolsFile) => {
        try {
            const drlCode = MetaToDRLTransformer.generate(nextFile)
            setInitialDrlPreview(drlCode)
            setDrlContent(drlCode)
        } catch (e) {
            setInitialDrlPreview("")
        }
    }, 400)

    const regenerateDroolFile = useDebounced((drl: string) => {
        try {
            const regeneratedFile = DRLToMetaTransformer.parse(drl)
            setDrlContent(drl)
            setInitialRule(regeneratedFile)
        } catch (e) {
            updateConsoleMessages([{
                time:new Date(),
                type:"warning",
                content: e
            }])
        }
    }, 400)

    return <Group orientation={"horizontal"} style={{display: "flex", gap: "1.5rem", width: "100%"}}>
        {(validateIsPending || upsertRulePending) && <Loading fullScreen={true}/>}
        <Panel collapsible={true} minSize={"10%"} maxSize={"100%"} panelRef={builderPanelRef}>
            <Group orientation={"vertical"} style={{display: "flex", gap: "1.5rem"}}>
                <Panel collapsible={true} defaultSize={"50%"} minSize={"10%"}
                       style={{scrollbarWidth: "none"}}>
                    <RuleBuilder initialFile={initialRule}
                                 onSave={(file, drl) => {
                                     const ruleToSave = {...(rule ?? {})} as RuleDto
                                     const updatedRule = file.rules[0]
                                     ruleToSave.gameId = gameId
                                     ruleToSave.content = drl
                                     ruleToSave.name = updatedRule.name
                                     upsertRuleMutate(ruleToSave)
                                 }}
                                 onChange={(file) => {
                                     regenerateDrl(file)
                                 }}
                                 onBack={() => {
                                     navigateTo(`/games/${gameId}/rules`)
                                 }}
                    />
                </Panel>
                <PanelSeparator
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover > .MuiStack-root": {
                            opacity: "1"
                        }
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
                            sx={{
                                padding: 0,
                                minWidth: 0,
                                width: "min-content"
                            }}
                            onClick={() => {
                                consolePanelRef.current.collapse()
                            }}
                            variant={"contained"}
                        >
                            <ChevronLeft sx={{
                                transform: "rotate(-90deg)",
                                width: {
                                    lg: "2rem",
                                    md: "2rem",
                                    sm: "1.5rem",
                                    xs: "1.5rem"
                                },
                                height: {
                                    lg: "2rem",
                                    md: "2rem",
                                    sm: "1.5rem",
                                    xs: "1.5rem"
                                }
                            }}/>
                        </Button>
                        <Button
                            sx={{
                                padding: 0,
                                minWidth: 0,
                                width: "min-content"
                            }}
                            variant={"contained"}
                        >
                            <DragIndicator sx={{
                                transform: "rotate(90deg)",
                                width: {
                                    lg: "1.5rem",
                                    md: "1.5rem",
                                    sm: "1.2rem",
                                    xs: "1.2rem"
                                },
                                height: {
                                    lg: "1.5rem",
                                    md: "1.5rem",
                                    sm: "1.2rem",
                                    xs: "1.2rem"
                                }
                            }}/>
                        </Button>
                        <Button
                            sx={{
                                padding: 0,
                                minWidth: 0,
                                width: "min-content"
                            }}
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
                                width: {
                                    lg: "2rem",
                                    md: "2rem",
                                    sm: "1.5rem",
                                    xs: "1.5rem"
                                },
                                height: {
                                    lg: "2rem",
                                    md: "2rem",
                                    sm: "1.5rem",
                                    xs: "1.5rem"
                                }
                            }}/>
                        </Button>
                    </Stack>
                </PanelSeparator>
                <Panel defaultSize={0}
                       collapsible={true}
                       panelRef={consolePanelRef}
                >
                    <MessageConsole messages={consoleMessages}
                                    onClear={() => setConsoleMessages([])}
                    />
                </Panel>
            </Group>
        </Panel>
        <PanelSeparator
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover > .MuiStack-root": {
                    opacity: "1"
                }
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
                    sx={{
                        padding: 0,
                        minWidth: 0,
                        width: "min-content"
                    }}
                    onClick={() => {
                        builderPanelRef.current.collapse()
                    }}
                    variant={"contained"}
                >
                    <ChevronLeft sx={{
                        width: {
                            lg: "2rem",
                            md: "2rem",
                            sm: "1.5rem",
                            xs: "1.5rem"
                        },
                        height: {
                            lg: "2rem",
                            md: "2rem",
                            sm: "1.5rem",
                            xs: "1.5rem"
                        }
                    }}/>
                </Button>
                <Button
                    sx={{
                        padding: 0,
                        minWidth: 0,
                        width: "min-content"
                    }}
                    variant={"contained"}
                >
                    <DragIndicator sx={{
                        width: {
                            lg: "1.5rem",
                            md: "1.5rem",
                            sm: "1.2rem",
                            xs: "1.2rem"
                        },
                        height: {
                            lg: "1.5rem",
                            md: "1.5rem",
                            sm: "1.2rem",
                            xs: "1.2rem"
                        }
                    }}/>
                </Button>
                <Button
                    sx={{
                        padding: 0,
                        minWidth: 0,
                        width: "min-content"
                    }}
                    onClick={() => {
                        droolEditorPanelRef.current.collapse()
                    }}
                    variant={"contained"}
                >
                    <ChevronRight sx={{
                        width: {
                            lg: "2rem",
                            md: "2rem",
                            sm: "1.5rem",
                            xs: "1.5rem"
                        },
                        height: {
                            lg: "2rem",
                            md: "2rem",
                            sm: "1.5rem",
                            xs: "1.5rem"
                        }
                    }}/>
                </Button>
            </Stack>
        </PanelSeparator>
        <Panel collapsible={true} defaultSize={"30%"} minSize={"10%"} panelRef={droolEditorPanelRef}>
            <Stack sx={{gap: 2}}>
                <ButtonGroup>
                    <Button
                        fullWidth={true}
                        onClick={() => {
                            setReadonly(!readonly)
                        }}
                        variant={readonly ? "outlined" : "contained"}
                        endIcon={readonly ? <Edit/> : <Stop/>}
                    >
                        {readonly ? "Edit" : "Stop"}
                    </Button>
                    <Button
                        fullWidth={true}
                        variant={"contained"}
                        endIcon={<FactCheck/>}
                        onClick={() => {
                            validateReset()
                            const tmpRule = {
                                content: drlContent,
                                name: initialRule?.name ?? rule?.name ?? "validation-test-rule",
                                gameId: gameId
                            } satisfies RuleDto
                            validateMutation(tmpRule)
                        }}
                    >
                        Validate
                    </Button>
                </ButtonGroup>
                <DroolEditor sx={{width: "100%", height: "70dvh"}}
                             drl={initialDrlPreview}
                             readonly={readonly || validateIsPending || upsertRulePending}
                             onChange={(drl) => {
                                 regenerateDroolFile(drl)
                                 setDrlContent(drl)
                             }}
                />
            </Stack>
        </Panel>
    </Group>

}