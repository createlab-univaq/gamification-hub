import {useGame} from "../../components/GameContext.tsx";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useMutation} from "@tanstack/react-query";
import {simulationClient} from "../../api";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useFieldArray, useForm} from "react-hook-form";
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
import {Add, Delete, ExpandMore, PlayArrow} from "@mui/icons-material";
import type {PlayerStateDto, SimulationRequestDto, SimulationResultDto} from "../../api/types";
import {ChallengeCard} from "../../components/form/ChallengeCard.tsx";
import {parseValue} from "../../utils/builder-utils.ts";
import {Form} from "../../components/form/Form.tsx";
import {SimulationFlowGraph} from "../../components/simulation/SimulationFlowGraph.tsx";


type PointConceptRow = { name: string; score: string }
type BadgeCollectionRow = { name: string; badges: string }
type ChallengeRow = { name: string; modelName: string; state: string; fields: KVRow[] }

type KVRow = { key: string; value: string }

type SimulationFormValues = {
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

export function SimulationPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()

    const form = useForm<SimulationFormValues>({
        defaultValues: {
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

    const {mutate, data: result, isPending, reset} = useMutation<SimulationResultDto, unknown, SimulationFormValues>({
        mutationFn: (values) => simulationClient.simulate(buildRequest(game.id, values)),
        onSuccess: (data, variables) => {
            const testResult = matchExpectations(variables, data.finalState)
            if(testResult === null) {
                return
            }
            setNotification({
                notification: {
                    type: testResult ? "success" : "error",
                    title: testResult ? "Test passato" : "Test fallito",
                    content: testResult ? "Il risultato della simulazione corrisponde con i valori aspettati" : "Uno o più valori non corrispondono con quello pensato"
                },
                isSnack: true
            })
        },
        onError: (error) => {
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    return (
        <PageContainer>
            <Form form={form} onSubmit={(v) => {
                mutate(v)
            }}>
                <PageHeader
                    title={"Simulate Game"}
                    buttons={[
                        {
                            children: "Simulate",
                            type: "submit",
                            variant: "contained",
                            loading: isPending,
                            endIcon: <PlayArrow/>
                        },
                        {
                            children: "Clear",
                            type: "reset",
                            onClick: () => {
                                reset();
                            },
                            variant: "outlined",
                            loading: isPending,
                            endIcon: <Delete/>
                        }
                    ]}
                />
                <Stack direction={{xs: "column", md: "row"}} sx={{mt: 2, gap: 3}}>
                    {/* ── Form ── */}
                    <Stack sx={{flex: 1, minWidth: 0}}>
                        <Accordion sx={{borderRadius: 0}}>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography sx={{fontWeight: 600}}>Simulation Input</Typography>
                            </AccordionSummary>
                            <Stack sx={{flex: 1, minWidth: 0}}>
                                {/* Actions */}
                                <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Actions</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 1}}>
                                            {actions.fields.map((field, i) => (
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
                                                    <TextField size="small" fullWidth placeholder="action.id"
                                                               {...form.register(`actionIds.${i}.value`)}/>
                                                    <IconButton size="small" color="error"
                                                                onClick={() => actions.remove(i)}>
                                                        <Delete fontSize="small"/>
                                                    </IconButton>
                                                </Stack>
                                            ))}
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => actions.append({value: ""})}>
                                                Add Action
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Point Concepts */}
                                <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Point Concepts</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 1}}>
                                            {pointConcepts.fields.map((field, i) => (
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
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
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => pointConcepts.append({name: "", score: "0"})}>
                                                Add Point Concept
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Badge Collections */}
                                <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Badge Collections</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 1}}>
                                            {badgeCollections.fields.map((field, i) => (
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
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
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => badgeCollections.append({name: "", badges: ""})}>
                                                Add Badge Collection
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Challenges */}
                                <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Challenges</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 2}}>
                                            {challenges.fields.map((field, i) => (
                                                <ChallengeCard key={field.id} index={i} namePrefix="challenges"
                                                               control={form.control}
                                                               register={form.register}
                                                               onRemove={() => challenges.remove(i)}/>
                                            ))}
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => challenges.append({
                                                        name: "", modelName: "", state: "", fields: []
                                                    })}>
                                                Add Challenge
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
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
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
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => customData.append({key: "", value: ""})}>
                                                Add Attribute
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
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
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
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => inputData.append({key: "", value: ""})}>
                                                Add Attribute
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            </Stack>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography sx={{fontWeight: 600}}>Expected Output</Typography>
                            </AccordionSummary>
                            <Stack sx={{flex: 1, minWidth: 0}}>
                                <Typography variant="caption" color="text.secondary" sx={{px: 2, pt: 1}}>
                                    Only the entries listed here are checked against the simulated final state.
                                </Typography>

                                {/* Expected Point Concepts */}
                                <Accordion defaultExpanded
                                           sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Point Concepts</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 1}}>
                                            {expectedPointConcepts.fields.map((field, i) => (
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
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
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => expectedPointConcepts.append({
                                                        name: "",
                                                        score: "0"
                                                    })}>
                                                Add Point Concept
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Expected Badge Collections */}
                                <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Badge Collections</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 1}}>
                                            {expectedBadgeCollections.fields.map((field, i) => (
                                                <Stack key={field.id} direction="row"
                                                       sx={{gap: 1, alignItems: "center"}}>
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
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => expectedBadgeCollections.append({
                                                        name: "",
                                                        badges: ""
                                                    })}>
                                                Add Badge Collection
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Expected Challenges */}
                                <Accordion sx={{backgroundColor: "transparent", borderRadius: "0 !important"}}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{fontWeight: 600}}>Challenges</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack sx={{gap: 2}}>
                                            {expectedChallenges.fields.map((field, i) => (
                                                <ChallengeCard key={field.id} index={i} namePrefix="expectedChallenges"
                                                               control={form.control}
                                                               register={form.register}
                                                               onRemove={() => expectedChallenges.remove(i)}/>
                                            ))}
                                            <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                    onClick={() => expectedChallenges.append({
                                                        name: "", modelName: "", state: "", fields: []
                                                    })}>
                                                Add Challenge
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
                                <Typography color="text.secondary">Results will appear here</Typography>
                            </Box>
                        )}

                        {result && <>
                            <Typography variant="h6">
                                Fired Rules ({result.firedRules?.length ?? 0})
                            </Typography>
                            {result.firedRules?.length === 0
                                ? <Typography color="text.secondary">No rules fired.</Typography>
                                : <SimulationFlowGraph simulationResult={result}/>
                            }

                        </>}
                    </Stack>
                </Stack>
            </Form>
        </PageContainer>
    )
}
