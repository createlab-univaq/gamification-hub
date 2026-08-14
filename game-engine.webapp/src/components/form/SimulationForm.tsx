import {useMutation, useQuery} from "@tanstack/react-query";
import {badgeClient, challengeClient, pointConceptClient, scenarioClient, simulationClient} from "../../api";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {useEffect, useState} from "react";
import {Add, ArrowBack, Delete, DoneAll, Error, ExpandMore, Games, PlayArrow, Save, Science} from "@mui/icons-material";
import type {SimulationResultDto, SimulationScenarioDto} from "../../api/types";
import {ChallengeCard} from "./ChallengeCard.tsx";
import {Form} from "./Form.tsx";
import {FormInput} from "./FormInput.tsx";
import {SimulationFlowGraph} from "../simulation/SimulationFlowGraph.tsx";
import {PageHeader} from "../layout/PageHeader.tsx";
import {useTranslation} from "react-i18next";
import {useGame} from "../../hooks/use-game.ts";
import {Loading} from "../Loading.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {toIsoDate} from "../../utils/date-utils.ts";
import {ExpectationStatus} from "./ExpectationStatus.tsx";
import {
    allExpectationsPassed,
    buildExpectedState,
    buildRequest,
    emptySimulationForm,
    evaluateExpectations,
    type ExpectationVerdicts,
    type SimulationFormValues,
    toFormValues
} from "../../utils/simulation-utils.ts";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

interface SimulationFormProps {
    gameId: string
    scenario?: SimulationScenarioDto
}

export function SimulationForm({gameId, scenario}: SimulationFormProps) {
    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const game = useGame()
    const form = useForm<SimulationFormValues>({defaultValues: emptySimulationForm()})

    const actions = useFieldArray({control: form.control, name: "actionIds"})
    const pointConcepts = useFieldArray({control: form.control, name: "pointConcepts"})
    const badgeCollections = useFieldArray({control: form.control, name: "badgeCollections"})
    const challenges = useFieldArray({control: form.control, name: "challenges"})
    const customData = useFieldArray({control: form.control, name: "customData"})
    const inputData = useFieldArray({control: form.control, name: "data"})
    const expectedPointConcepts = useFieldArray({control: form.control, name: "expectedPointConcepts"})
    const expectedBadgeCollections = useFieldArray({control: form.control, name: "expectedBadgeCollections"})
    const expectedChallenges = useFieldArray({control: form.control, name: "expectedChallenges"})

    const {data: pointConceptOptions, isLoading: pointConceptsLoading} = useQuery({
        queryKey: ["get-point-concept", gameId],
        queryFn: () => pointConceptClient.getPointConcepts(gameId),
        enabled: !!gameId
    })
    const {data: badgeOptions, isLoading: badgesLoading} = useQuery({
        queryKey: ["get-badges", gameId],
        queryFn: () => badgeClient.getBadges(gameId),
        enabled: !!gameId
    })
    const {data: challengeModels, isLoading: challengeModelsLoading} = useQuery({
        queryKey: ["get-challenges", gameId],
        queryFn: () => challengeClient.getChallenges(gameId),
        enabled: !!gameId
    })

    // Badge names offered for a row are the ones belonging to the collection that row names.
    const badgesOf = (collectionName?: string) =>
        badgeOptions?.find(bc => bc.name === collectionName)?.badges ?? []

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
            // Captured from the values that were actually submitted, so the icons keep reporting the
            // run that produced them even if the expectations are edited afterwards.
            const evaluated = evaluateExpectations(variables, data.finalState)
            setVerdicts(evaluated)
            if (evaluated === null) {
                return
            }
            const testResult = allExpectationsPassed(evaluated)
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

    const [verdicts, setVerdicts] = useState<ExpectationVerdicts | null>(null)
    const simulationPassed = verdicts ? allExpectationsPassed(verdicts) : undefined

    // The stored verdicts are keyed by the name that was tested, so these follow renames: rename a
    // row and it simply has no verdict until the next run, rather than inheriting another row's.
    const expectedPointConceptRows = useWatch({control: form.control, name: "expectedPointConcepts"})
    const expectedBadgeRows = useWatch({control: form.control, name: "expectedBadgeCollections"})
    const expectedChallengeRows = useWatch({control: form.control, name: "expectedChallenges"})

    const {mutate: saveScenario, isPending: isSaving} = useMutation({
        mutationFn: (values: SimulationFormValues) => {
            const payload: SimulationScenarioDto = {
                name: values.name,
                syntheticState: buildRequest(gameId, values).syntheticState,
                expectedOutput: buildExpectedState(values),
                executionMoment: values.executionMoment ? toIsoDate(values.executionMoment) : undefined
            }
            return scenario?.id
                ? scenarioClient.updateScenario(gameId, scenario.id, payload)
                : scenarioClient.createScenario(gameId, payload)
        },
        onSuccess: (data) => {
            if (!scenario) {
                navigateTo(`/games/${gameId}/scenarios/upsert/${data.id}`, {
                    state: {
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
                    <Stack>
                        <Stack direction={"row"} sx={{gap: 2}}>
                            <FormInput name={"name"} rules={{required: t("required_field")}}>
                                <TextField label={t("name")} placeholder={t("scenarios.form.name_placeholder")}
                                           required={true}/>
                            </FormInput>
                            <FormInput name={"executionMoment"}>
                                <TextField type={"datetime-local"} label={t("scenarios.form.execution_moment")}
                                           slotProps={{inputLabel: {shrink: true}}}/>
                            </FormInput>
                        </Stack>
                    </Stack>
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
                            lg: "35%",
                            md: "35%"
                        }
                    }}
                >
                    <Accordion sx={{borderRadius: 0}} defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Typography sx={{fontWeight: 600}}>{t("scenarios.form.inputs.title")}
                            </Typography>
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
                                                <AutocompleteFormItem
                                                    name={`actionIds.${i}.value`}
                                                    placeholder="action.id"
                                                    options={game.actions ?? []}
                                                    getOptionLabel={(a) => a}
                                                    freeSolo={true}
                                                    size="small"
                                                    fullWidth={true}/>
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
                                                <AutocompleteFormItem
                                                    name={`pointConcepts.${i}.name`}
                                                    placeholder="Name"
                                                    options={pointConceptOptions ?? []}
                                                    getOptionLabel={(pc) => pc.name ?? ""}
                                                    getOptionValue={(pc) => pc.name}
                                                    loading={pointConceptsLoading}
                                                    freeSolo={true}
                                                    size="small"
                                                    sx={{flex: 2}}/>
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
                                                <AutocompleteFormItem
                                                    name={`badgeCollections.${i}.name`}
                                                    placeholder="Name"
                                                    options={badgeOptions ?? []}
                                                    getOptionLabel={(bc) => bc.name ?? ""}
                                                    getOptionValue={(bc) => bc.name}
                                                    loading={badgesLoading}
                                                    freeSolo={true}
                                                    size="small"
                                                    sx={{flex: 1}}/>
                                                <AutocompleteFormItem
                                                    name={`badgeCollections.${i}.badges`}
                                                    placeholder="badges"
                                                    options={badgesOf(form.watch(`badgeCollections.${i}.name`))}
                                                    getOptionLabel={(b) => b}
                                                    loading={badgesLoading}
                                                    multiple={true}
                                                    freeSolo={true}
                                                    size="small"
                                                    sx={{flex: 2}}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => badgeCollections.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => badgeCollections.append({name: "", badges: []})}>
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
                                                           challengeModels={challengeModels}
                                                           challengeModelsLoading={challengeModelsLoading}
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
                            <Stack direction="row" sx={{gap: 1}}>
                                <Typography sx={{fontWeight: 600}}>{t("scenarios.form.outputs.title")}</Typography>
                                {simulationPassed != undefined ? simulationPassed ?
                                    <DoneAll color={"success"} titleAccess={t("scenarios.form.test.success.detail")}/> :
                                    <Error color={"error"}
                                           titleAccess={t("scenarios.form.test.error.detail")}/> : <></>}
                            </Stack>
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
                                        {expectedPointConcepts.fields.map((field, i) => {
                                            const verdict = verdicts?.pointConcepts[expectedPointConceptRows?.[i]?.name]
                                            return <Stack key={field.id} direction="row"
                                                          sx={{gap: 1, alignItems: "center"}}>
                                                <AutocompleteFormItem
                                                    name={`expectedPointConcepts.${i}.name`}
                                                    placeholder="Name"
                                                    options={pointConceptOptions ?? []}
                                                    getOptionLabel={(pc) => pc.name ?? ""}
                                                    getOptionValue={(pc) => pc.name}
                                                    loading={pointConceptsLoading}
                                                    freeSolo={true}
                                                    size="small"
                                                    sx={{flex: 2}}/>
                                                <TextField size="small" placeholder="Score" type="number"
                                                           slotProps={{
                                                               htmlInput: {
                                                                   step: "any"
                                                               }
                                                           }}
                                                           sx={{flex: 1}}
                                                           {...form.register(`expectedPointConcepts.${i}.score`)}/>
                                                <ExpectationStatus verdict={verdict}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => expectedPointConcepts.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        })}
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
                                        {expectedBadgeCollections.fields.map((field, i) => {
                                            const verdict = verdicts?.badgeCollections[expectedBadgeRows?.[i]?.name]
                                            return <Stack key={field.id} direction="row"
                                                          sx={{gap: 1, alignItems: "center"}}>
                                                <AutocompleteFormItem
                                                    name={`expectedBadgeCollections.${i}.name`}
                                                    placeholder="Name"
                                                    options={badgeOptions ?? []}
                                                    getOptionLabel={(bc) => bc.name ?? ""}
                                                    getOptionValue={(bc) => bc.name}
                                                    loading={badgesLoading}
                                                    freeSolo={true}
                                                    size="small"
                                                    sx={{flex: 1}}/>
                                                <AutocompleteFormItem
                                                    name={`expectedBadgeCollections.${i}.badges`}
                                                    placeholder="badges"
                                                    options={badgesOf(form.watch(`expectedBadgeCollections.${i}.name`))}
                                                    getOptionLabel={(b) => b}
                                                    loading={badgesLoading}
                                                    multiple={true}
                                                    freeSolo={true}
                                                    size="small"
                                                    sx={{flex: 2}}/>
                                                <ExpectationStatus verdict={verdict}/>
                                                <IconButton size="small" color="error"
                                                            onClick={() => expectedBadgeCollections.remove(i)}>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        })}
                                        <Button size="small" endIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                                                onClick={() => expectedBadgeCollections.append({name: "", badges: []})}>
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
                                        {expectedChallenges.fields.map((field, i) => {
                                            const verdict = verdicts?.challenges[expectedChallengeRows?.[i]?.name]
                                            return <ChallengeCard key={field.id} index={i}
                                                                  namePrefix="expectedChallenges"
                                                                  control={form.control}
                                                                  register={form.register}
                                                                  challengeModels={challengeModels}
                                                                  challengeModelsLoading={challengeModelsLoading}
                                                                  verdict={verdict}
                                                                  onRemove={() => expectedChallenges.remove(i)}/>
                                        })}
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
                        {result.firedRules?.length === 0
                            ?
                            <Typography color="text.secondary">{t("scenarios.form.outputs.no_rules_fired")}</Typography>
                            :
                            <Stack>
                                <SimulationFlowGraph simulationResult={result} passed={simulationPassed}/>
                            </Stack>
                        }
                    </>}
                </Stack>
            </Stack>
        </Form>
    )
}
