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

    useEffect(() => {
        console.log(consoleMessages)
    }, [consoleMessages]);

    const {mutate: upsertRuleMutate, isPending: upsertRulePending} = useMutation({
        mutationFn: (request) => {
            setConsoleMessages([...consoleMessages, {
                time:new Date(),
                type:"text",
                content:rule ? "Updating rule..." : "Creating rule...."
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
                time:new Date()
            }])
            return ruleClient.validateRule(request)
        },
        onSettled: (data) => {
            console.log("SETTLED")
            if (!Object.keys(data).length) {
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
            const errors = Object.entries(data)
            setConsoleMessages(errors.map(e => {
                return {
                    content: e[1],
                    type: "error",
                    time:new Date()
                } satisfies ConsoleMessage
            }))
            setNotification({
                notification: {
                    type: "error",
                    content: <Stack>{errors.map(e => <Typography>{e[0]}: {e[1]}</Typography>)}</Stack>,
                    title: "Rule validation failed",
                },
                isSnack: true
            })
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
            setConsoleMessages(detailsError)
        }
        setNotification({
            notification: translateApiErrorToNotification(apiError),
            isSnack: true
        })
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
            console.error(e)
            // TODO notify
        }
    }, 400)

    return <Group orientation={"vertical"} style={{display: "flex", gap: "1.5rem", width: "100%"}}>
        <Panel collapsible={true} minSize={"10%"} maxSize={"100%"}>
            <Group orientation={"horizontal"} style={{display: "flex", gap: "1.5rem"}}>
                {(validateIsPending || upsertRulePending) && <Loading fullScreen={true}/>}
                <Panel collapsible={true} defaultSize={"50%"} minSize={"10%"} panelRef={builderPanelRef}
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
                <PanelSeparator sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <Stack
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
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
                                        name: initialRule?.name ?? "validation-test-rule",
                                        gameId: gameId
                                    } satisfies RuleDto
                                    console.log(tmpRule)
                                    validateMutation(tmpRule)
                                }}
                            >
                                Validate
                            </Button>
                        </ButtonGroup>
                        <DroolEditor sx={{width: "100%"}}
                                     drl={initialDrlPreview}
                                     readonly={readonly || validateIsPending || upsertRulePending}
                                     onChange={(drl) => {
                                         regenerateDroolFile(drl)
                                         console.log(drl)
                                         setDrlContent(drl)
                                     }}
                        />
                    </Stack>
                </Panel>
            </Group>
        </Panel>
        <PanelSeparator sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Stack
                direction={"row"}
                sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    left: {
                        lg: '50%',
                        md: '50%',
                        sm: '50%',
                        xs: '35%'
                    },
                    width: "fit-content",
                    "&:hover":{
                        visibility:"visible"
                    }
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
                        consolePanelRef.current.expand()
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
                            onClear={()=>setConsoleMessages([])}
            />
        </Panel>
    </Group>

}