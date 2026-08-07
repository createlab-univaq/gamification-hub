import {useMutation} from "@tanstack/react-query";
import {scenarioClient, simulationClient} from "../../api";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useFieldArray, useForm} from "react-hook-form";
import {useEffect} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {Add, ArrowBack, Delete, ExpandMore, Games, PlayArrow, Save, Science} from "@mui/icons-material";
import type {
    PlayerStateDto,
    SimulationRequestDto,
    SimulationResultDto,
    SimulationScenarioDto,
    SyntheticStateDto
} from "../../api/types";
import {ChallengeCard} from "./ChallengeCard.tsx";
import {parseValue} from "../../utils/builder-utils.ts";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {SimulationFlowGraph} from "../simulation/SimulationFlowGraph.tsx";
import {PageHeader} from "../layout/PageHeader.tsx";
import {useTranslation} from "react-i18next";
import {useGame} from "../../hooks/use-game.ts";
import {Loading} from "../Loading.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";

interface SimulationFormProps {
    gameId: string
    scenario?: SimulationScenarioDto
}

type PointConceptRow = { name: string; score: string }
type BadgeCollectionRow = { name: string; badges: string }
type ChallengeRow = { name: string; modelName: string; state: string; fields: KVRow[] }

type KVRow = { key: string; value: string }

export type SimulationFormValues = {
    name: string
    actionIds: { value: string }[]
    pointConcepts: PointConceptRow[]
    badgeCollections: BadgeCollectionRow[]
    challenges: ChallengeRow[]
    customData: KVRow[]
    data: KVRow[]
    expectedPointConcepts: PointConceptRow[]
    expectedBadgeCollections: BadgeCollectionRow[]
    expectedChallenges: ChallengeRow[]
}

function matchExpectations(values: SimulationFormValues, finalState?: PlayerStateDto): boolean | null {
    const pcs = values.expectedPointConcepts.filter(r => r.name)
    const bcs = values.expectedBadgeCollections.filter(r => r.name)
    const chs = values.expectedChallenges.filter(r => r.name)
    if ((!pcs.length && !bcs.length && !chs.length) || !finalState) {
        return null
    }
    for (const pc of pcs) {
        const actual = finalState.pointConcepts?.find(a => a.name === pc.name)
        if (!actual || (actual.score ?? 0) !== (parseFloat(pc.score) || 0)) {
            return false
        }
    }
    for (const bc of bcs) {
        const actual = finalState.badgeCollections?.find(a => a.name === bc.name)
        if (!actual) {
            return false
        }
        const expectedBadges = bc.badges ? bc.badges.split(",").map(b => b.trim()).filter(Boolean) : []
        if (!expectedBadges.every(b => actual.badges?.includes(b))) {
            return false
        }
    }
    for (const ch of chs) {
        const actual = finalState.challenges?.find(a => a.name === ch.name)
        if (!actual) {
            return false
        }
        if (ch.modelName && actual.modelName !== ch.modelName) {
            return false
        }
        if (ch.state && actual.state !== ch.state) {
            return false
        }
        for (const f of ch.fields.filter(r => r.key)) {
            if (actual.fields?.[f.key] !== parseValue(f.value)) {
                return false
            }
        }
    }
    return true
}

function buildRequest(gameId: string, values: SimulationFormValues): SimulationRequestDto {
    return {
        gameId,
        syntheticState: {
            actionIds: values.actionIds.map(a => a.value).filter(Boolean),
            pointConcepts: values.pointConcepts
                .filter(pc => pc.name)
                .map(pc => ({name: pc.name, score: parseFloat(pc.score) || 0})),
            badgeCollections: values.badgeCollections
                .filter(bc => bc.name)
                .map(bc => ({
                    name: bc.name,
                    badges: bc.badges ? bc.badges.split(",").map(b => b.trim()).filter(Boolean) : []
                })),
            challenges: values.challenges
                .filter(c => c.name)
                .map(c => ({
                    name: c.name,
                    modelName: c.modelName || undefined,
                    state: c.state || undefined,
                    fields: c.fields.length
                        ? Object.fromEntries(c.fields.filter(r => r.key).map(r => [r.key, parseValue(r.value)]))
                        : undefined,
                })),
            customData: values.customData.length
                ? Object.fromEntries(values.customData.filter(r => r.key).map(r => [r.key, parseValue(r.value)]))
                : undefined,
        },
        data: values.data.length
            ? Object.fromEntries(values.data.filter(r => r.key).map(r => [r.key, parseValue(r.value)]))
            : undefined,
        showDetailedChanges: true,
    };
}

function buildExpectedState(values: SimulationFormValues): SyntheticStateDto {
    return {
        pointConcepts: values.expectedPointConcepts
            .filter(pc => pc.name)
            .map(pc => ({name: pc.name, score: parseFloat(pc.score) || 0})),
        badgeCollections: values.expectedBadgeCollections
            .filter(bc => bc.name)
            .map(bc => ({
                name: bc.name,
                badges: bc.badges ? bc.badges.split(",").map(b => b.trim()).filter(Boolean) : []
            })),
        challenges: values.expectedChallenges
            .filter(c => c.name)
            .map(c => ({
                name: c.name,
                modelName: c.modelName || undefined,
                state: c.state || undefined,
                fields: c.fields.length
                    ? Object.fromEntries(c.fields.filter(r => r.key).map(r => [r.key, parseValue(r.value)]))
                    : undefined,
            })),
    };
}

function toFormValues(scenario: SimulationScenarioDto): SimulationFormValues {
    const state = scenario.syntheticState ?? {}
    const expected = scenario.expectedOutput ?? {}
    return {
        name: scenario.name ?? "",
        actionIds: (state.actionIds ?? []).map(value => ({value})),
        pointConcepts: (state.pointConcepts ?? []).map(pc => ({name: pc.name ?? "", score: String(pc.score ?? 0)})),
        badgeCollections: (state.badgeCollections ?? []).map(bc => ({
            name: bc.name ?? "",
            badges: (bc.badges ?? []).join(", ")
        })),
        challenges: (state.challenges ?? []).map(c => ({
            name: c.name ?? "",
            modelName: c.modelName ?? "",
            state: c.state ?? "",
            fields: Object.entries(c.fields ?? {}).map(([key, value]) => ({key, value: String(value)}))
        })),
        customData: Object.entries(state.customData ?? {}).map(([key, value]) => ({key, value: String(value)})),
        data: [],
        expectedPointConcepts: (expected.pointConcepts ?? []).map(pc => ({
            name: pc.name ?? "",
            score: String(pc.score ?? 0)
        })),
        expectedBadgeCollections: (expected.badgeCollections ?? []).map(bc => ({
            name: bc.name ?? "",
            badges: (bc.badges ?? []).join(", ")
        })),
        expectedChallenges: (expected.challenges ?? []).map(c => ({
            name: c.name ?? "",
            modelName: c.modelName ?? "",
            state: c.state ?? "",
            fields: Object.entries(c.fields ?? {}).map(([key, value]) => ({key, value: String(value)}))
        })),
    }
}

export function SimulationForm({gameId, scenario}: SimulationFormProps) {
    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const game = useGame()
    const form = useForm<SimulationFormValues>({
        defaultValues: {
            name: "",
            actionIds: [],
            pointConcepts: [],
            badgeCollections: [],
            challenges: [],
            customData: [],
            data: [],
            expectedPointConcepts: [],
            expectedBadgeCollections: [],
            expectedChallenges: [],
        }
    })

    const actions = useFieldArray({control: form.control, name: "actionIds"})
    const pointConcepts = useFieldArray({control: form.control, name: "pointConcepts"})
    const badgeCollections = useFieldArray({control: form.control, name: "badgeCollections"})
    const challenges = useFieldArray({control: form.control, name: "challenges"})
    const customData = useFieldArray({control: form.control, name: "customData"})
    const inputData = useFieldArray({control: form.control, name: "data"})
    const expectedPointConcepts = useFieldArray({control: form.control, name: "expectedPointConcepts"})
    const expectedBadgeCollections = useFieldArray({control: form.control, name: "expectedBadgeCollections"})
    const expectedChallenges = useFieldArray({control: form.control, name: "expectedChallenges"})

    useEffect(() => {
        resetForm(scenario)
    }, [scenario]);

    const resetForm = (values?: SimulationScenarioDto) => {
        if (values) {
            form.reset(toFormValues(values))
        } else {
            form.reset()
        }
    }

    const {mutate, data: result, isPending, reset} = useMutation<SimulationResultDto, object, SimulationFormValues>({
        mutationFn: (values) => simulationClient.simulate(buildRequest(gameId, values)),
        onSuccess: (data, variables) => {
            const testResult = matchExpectations(variables, data.finalState)
            if (testResult === null) {
                return
            }
            setNotification({
                notification: {
                    type: testResult ? "success" : "error",
                    title: testResult ? t("scenarios.form.outputs.test.success.title") : t("scenarios.form.outputs.test.fail.title"),
                    content: testResult ? t("scenarios.form.outputs.test.success.message") : t("scenarios.form.outputs.test.fail.message")
                },
                isSnack: true
            })
        },
        onError: (error) => {
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    const {mutate: saveScenario, isPending: isSaving} = useMutation({
        mutationFn: (values: SimulationFormValues) => {
            const payload: SimulationScenarioDto = {
                name: values.name,
                syntheticState: buildRequest(gameId, values).syntheticState,
                expectedOutput: buildExpectedState(values)
            }
            return scenario?.id
                ? scenarioClient.updateScenario(gameId, scenario.id, payload)
                : scenarioClient.createScenario(gameId, payload)
        },
        onSuccess: (data) => {
            if(!scenario) {
                navigateTo(`/games/${gameId}/scenarios/upsert/${data.id}`, {
                    state:{
                        type: "success",
                        title: t("scenarios.form.save.title"),
                        content: t("scenarios.form.save.message", {name: data.name})
                    }
                })
                return
            }
            setNotification({
                notification: {
                    type: "success",
                    title: t("scenarios.form.save.title"),
                    content: t("scenarios.form.save.message", {name: data.name})
                },
                isSnack: true
            })
        },
        onError: (error) => {
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    const name = form.watch("name")

    const onSave = () => {
        saveScenario(form.getValues())
    }

    return (
        <Form form={form} onSubmit={(v) => {
            mutate(v as SimulationFormValues)
        }}>
            <PageHeader
                title={
                    <FormInput name={"name"}>
                        <TextField label={t("name")} placeholder={t("scenarios.form.name_placeholder")}/>
                    </FormInput>
                }
                buttons={[
                    {
                        children: t("buttons:turn_back"),
                        variant: "outlined",
                        type: "button",
                        startIcon: <ArrowBack/>,
                        disabled: isSaving,
                        href: `/games/${gameId}/scenarios`
                    },
                    {
                        children: t("buttons:save"),
                        variant: "contained",
                        type: "button",
                        loading: isSaving || isPending,
                        disabled: !name?.trim() || isSaving || isPending,
                        endIcon: <Save/>,
                        onClick: onSave
                    },
                    {
                        children: t("buttons:simulate"),
                        type: "submit",
                        variant: "contained",
                        loading: isPending,
                        endIcon: <PlayArrow/>,
                        onClick: form.handleSubmit((v) => mutate(v as SimulationFormValues))
                    },
                    {
                        children: t("buttons:reset"),
                        onClick: () => {
                            reset()
                            resetForm(scenario)
                        },
                        variant: "outlined",
                        loading: isPending,
                        endIcon: <Delete/>
                    }
                ]}
                breadcrumbs={[
                    {
                        icon: <Games/>,
                        label: t("sidebar.games"),
                        href: "/dashboard"
                    },
                    {
                        label: game.name ?? "My Game",
                        href: `/games/${game.id}`
                    },
                    {
                        label: t("sidebar.scenarios"),
                        href: `/games/${game.id}/scenarios`,
                        icon: <Science/>
                    }
                ]}
            />
            <Stack direction={{xs: "column", md: "row"}} sx={{mt: 2, gap: 3}}>
                {/* ── Form ── */}
                <Stack
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        maxWidth: {
                            lg:"35%",
                            md:"35%"
                        }
                    }}
                >
                    <Accordion sx={{borderRadius: 0}} defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Typography sx={{fontWeight: 600}}>{t("scenarios.form.inputs.title")}</Typography>
                        </AccordionSummary>
                        <Stack sx={{flex: 1, minWidth: 0}}>
                            {/* Actions */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.actions")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {actions.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" fullWidth placeholder="action.id"
                                                           {...form.register(`actionIds.${i}.value`)}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => actions.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => actions.append({value: ""})}>
                                            {t("buttons:scenarios.add_action")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Point Concepts */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.points")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {pointConcepts.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" placeholder="Name" sx={{flex: 2}}
                                                           {...form.register(`pointConcepts.${i}.name`)}/>
                                                <TextField size="small" placeholder="Score" type="number"
                                                           slotProps={{htmlInput: {step: "any"}}}
                                                           sx={{flex: 1}}
                                                           {...form.register(`pointConcepts.${i}.score`)}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => pointConcepts.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => pointConcepts.append({name: "", score: "0"})}>
                                            {t("buttons:scenarios.add_point_concept")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Badge Collections */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.badges")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {badgeCollections.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" placeholder="Name" sx={{flex: 1}}
                                                           {...form.register(`badgeCollections.${i}.name`)}/>
                                                <Tooltip title="Comma-separated badge names">
                                                    <TextField size="small" placeholder="badge1, badge2"
                                                               sx={{flex: 2}}
                                                               {...form.register(`badgeCollections.${i}.badges`)}/>
                                                </Tooltip>
                                                <IconButton size="small" color="error"
                                                            onClick={() => badgeCollections.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => badgeCollections.append({name: "", badges: ""})}>
                                            {t("buttons:scenarios.add_badge_collection")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Challenges */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.challenges")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 2}}>
                                        {challenges.fields.map((field, i) => (
                                            <ChallengeCard key={field.id} index={i} namePrefix="challenges"
                                                           control={form.control}
                                                           register={form.register}
                                                           onRemove={() => challenges.remove(i)}/>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => challenges.append({
                                                    name: "", modelName: "", state: "", fields: []
                                                })}>
                                            {t("buttons:scenarios.add_challenge")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Custom Data */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>Custom Data</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {customData.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" placeholder="key" sx={{flex: 1}}
                                                           {...form.register(`customData.${i}.key`)}/>
                                                <TextField size="small" placeholder="value" sx={{flex: 2}}
                                                           {...form.register(`customData.${i}.value`)}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => customData.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => customData.append({key: "", value: ""})}>
                                            {t("buttons:scenarios.add_attribute")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Input Data */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>Input Data</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {inputData.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" placeholder="key" sx={{flex: 1}}
                                                           {...form.register(`data.${i}.key`)}/>
                                                <TextField size="small" placeholder="value" sx={{flex: 2}}
                                                           {...form.register(`data.${i}.value`)}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => inputData.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => inputData.append({key: "", value: ""})}>
                                            {t("buttons:scenarios.add_attribute")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        </Stack>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Typography sx={{fontWeight: 600}}>{t("scenarios.form.outputs.title")}</Typography>
                        </AccordionSummary>
                        <Stack sx={{flex: 1, minWidth: 0}}>
                            {/* Expected Point Concepts */}
                            <Accordion defaultExpanded
                                       sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.points")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {expectedPointConcepts.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" placeholder="Name" sx={{flex: 2}}
                                                           {...form.register(`expectedPointConcepts.${i}.name`)}/>
                                                <TextField size="small" placeholder="Score" type="number"
                                                           slotProps={{htmlInput: {step: "any"}}}
                                                           sx={{flex: 1}}
                                                           {...form.register(`expectedPointConcepts.${i}.score`)}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => expectedPointConcepts.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => expectedPointConcepts.append({name: "", score: "0"})}>
                                            {t("buttons:scenarios.add_point_concept")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Expected Badge Collections */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.badges")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 1}}>
                                        {expectedBadgeCollections.fields.map((field, i) => (
                                            <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                                                <TextField size="small" placeholder="Name" sx={{flex: 1}}
                                                           {...form.register(`expectedBadgeCollections.${i}.name`)}/>
                                                <Tooltip title="Comma-separated badge names">
                                                    <TextField size="small" placeholder="badge1, badge2"
                                                               sx={{flex: 2}}
                                                               {...form.register(`expectedBadgeCollections.${i}.badges`)}/>
                                                </Tooltip>
                                                <IconButton size="small" color="error"
                                                            onClick={() => expectedBadgeCollections.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => expectedBadgeCollections.append({name: "", badges: ""})}>
                                            {t("buttons:scenarios.add_badge_collection")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                            {/* Expected Challenges */}
                            <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography sx={{fontWeight: 600}}>{t("sidebar.challenges")}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack sx={{gap: 2}}>
                                        {expectedChallenges.fields.map((field, i) => (
                                            <ChallengeCard key={field.id} index={i} namePrefix="expectedChallenges"
                                                           control={form.control}
                                                           register={form.register}
                                                           onRemove={() => expectedChallenges.remove(i)}/>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => expectedChallenges.append({
                                                    name: "", modelName: "", state: "", fields: []
                                                })}>
                                            {t("buttons:scenarios.add_challenge")}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        </Stack>
                    </Accordion>
                </Stack>

                {/* ── Results ── */}
                <Stack sx={{flex: 1, minWidth: 0, gap: 2}}>
                    {!result && !isPending && (
                        <Box sx={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            height: 200, border: "1px dashed", borderColor: "divider", borderRadius: 2
                        }}>
                            <Typography color="text.secondary">{t("scenarios.form.outputs.placeholder")}</Typography>
                        </Box>
                    )}
                    {isPending &&
                        <Stack sx={{alignItems: "center", justifyContent: "center"}}>
                            <Loading/>
                        </Stack>
                    }
                    {result && <>
                        <Typography variant="h6">
                            {t("scenarios.form.outputs.count", {count: result.firedRules?.length ?? 0})}
                        </Typography>
                        {result.firedRules?.length === 0
                            ?
                            <Typography color="text.secondary">{t("scenarios.form.outputs.no_rules_fired")}</Typography>
                            : <SimulationFlowGraph simulationResult={result}/>
                        }
                    </>}
                </Stack>
            </Stack>
        </Form>
    )
}
