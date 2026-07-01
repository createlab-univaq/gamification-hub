import type {LevelDto} from "../../api/types";
import type {FieldValues} from "react-hook-form";
import {useFieldArray, useForm} from "react-hook-form";
import {Form} from "./Form.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {challengeClient, levelClient, pointConceptClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {Button, Card, CardContent, Collapse, Divider, IconButton, Stack, TextField, Typography} from "@mui/material";
import {Add, Delete, Settings} from "@mui/icons-material";
import {FormInput} from "./FormInput.tsx";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";
import {useEffect, useState} from "react";

interface LevelFormProps {
    gameId: string,
    level?: LevelDto
}

type ThresholdConfig = {
    choices: number
    availableModels: string[]
    activeModels: string[]
}
type ThresholdRow = { name: string; value: number; config: ThresholdConfig }
type LevelFormValues = {
    name: string
    pointConceptName: string
    thresholds: ThresholdRow[]
}

const emptyConfig = (): ThresholdConfig => ({choices: 0, availableModels: [], activeModels: []})

export function LevelForm({level, gameId}: LevelFormProps) {

    const {setNotification} = useNotificationContext()
    const [openConfigs, setOpenConfigs] = useState<Set<string>>(new Set())
    const form = useForm<LevelFormValues>({
        defaultValues: {
            name: "",
            pointConceptName: "",
            thresholds: []
        }
    })
    const thresholds = useFieldArray({control: form.control, name: "thresholds"})
    const {data: pointConcepts, isLoading: pointConceptsLoading} = useQuery({
        queryKey: ["get-point-concept", gameId],
        queryFn: () => pointConceptClient.getPointConcepts(gameId),
        enabled: !!gameId
    })
    const {data: challengeModels, isLoading: challengeModelsLoading} = useQuery({
        queryKey: ["get-challenges", gameId],
        queryFn: () => challengeClient.getChallenges(gameId),
        enabled: !!gameId
    })

    const toggleConfig = (id: string) => setOpenConfigs(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ["upsert-level"],
        mutationFn: ({gameId, lvl}) => levelClient.upsertLevel(gameId, lvl),
        onSuccess: (data) => {
            navigateTo(`/games/${gameId}/levels`, {
                state: {
                    type: "success",
                    title: `Livello salvato!`,
                    content: `Il livello ${data.name} è stato salvato con successo`
                }
            })
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({
                notification: translateApiErrorToNotification(apiError),
                isSnack: true
            })
        }
    })

    function initForm(level: LevelDto) {
        form.reset({
            name: level?.name ?? "",
            pointConceptName: level?.pointConceptName ?? "",
            thresholds: (level?.thresholds ?? []).map(t => ({
                name: t.name ?? "",
                value: t.value ?? 0,
                config: {
                    choices: t.config?.choices ?? 0,
                    availableModels: t.config?.availableModels ?? [],
                    activeModels: t.config?.activeModels ?? []
                }
            }))
        })
    }

    function handleSubmit(formValues: FieldValues) {
        mutate({
            gameId: gameId,
            lvl: formValues
        })
    }

    useEffect(() => {
        if (level) {
            initForm(level)
        }
    }, [level]);

    return <Form form={form} onSubmit={handleSubmit} readonly={isPending}>
        <Stack sx={{gap: 3}}>
            <FormInput
                name={"name"}
                rules={{
                    required: "Campo obbligatorio!"
                }}
            >
                <TextField label={"Nome"} required={true} fullWidth={true} type={"text"}/>
            </FormInput>
            <AutocompleteFormItem
                name={"pointConceptName"}
                label={"Nome punteggio"}
                options={pointConcepts ?? []}
                getOptionLabel={(pc) => pc.name ?? ""}
                getOptionValue={(pc) => pc.name}
                rules={{required: "Campo obbligatorio!"}}
                loading={pointConceptsLoading}
            />

            <Stack sx={{gap: 1}}>
                <Divider/>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>Soglie</Typography>
                <Typography variant={"caption"} color={"text.secondary"}>
                    Definisci le soglie del livello. L'ordine determina l'indice della soglia.
                </Typography>
                {thresholds.fields.map((field, i) => {
                    const open = openConfigs.has(field.id)
                    return (
                        <Card key={field.id} variant={"outlined"}>
                            <CardContent>
                                <Stack direction={"row"} sx={{gap: 1, alignItems: "center"}}>
                                    <FormInput
                                        name={`thresholds.${i}.name`}
                                        rules={{
                                            required: "Campo obbligatorio!"
                                        }}
                                    >
                                        <TextField label={"Nome soglia"} fullWidth={true} required={true}/>
                                    </FormInput>
                                    <FormInput
                                        name={`thresholds.${i}.value`}
                                        rules={{
                                            required: "Campo obbligatorio",
                                            valueAsNumber: true,
                                            min: 0
                                        }}
                                    >
                                        <TextField label={"Valore"} type={"number"} required={true}
                                                   slotProps={{htmlInput: {min: 0}}}/>
                                    </FormInput>
                                    <IconButton color={open ? "primary" : "default"}
                                                onClick={() => toggleConfig(field.id)}>
                                        <Settings/>
                                    </IconButton>
                                    <IconButton color={"error"} onClick={() => thresholds.remove(i)}>
                                        <Delete/>
                                    </IconButton>
                                </Stack>
                                <Collapse in={open}>
                                    <Stack sx={{gap: 2, mt: 2}}>
                                        <Typography variant={"caption"} color={"text.secondary"}>
                                            Configurazione sfide della soglia
                                        </Typography>
                                        <FormInput
                                            name={`thresholds.${i}.config.choices`}
                                            rules={{
                                                valueAsNumber: true,
                                                min: 0
                                            }}
                                        >
                                            <TextField label={"Numero scelte"} type={"number"}
                                                       slotProps={{htmlInput: {min: 0}}}/>
                                        </FormInput>
                                        <AutocompleteFormItem
                                            name={`thresholds.${i}.config.availableModels`}
                                            label={"Modelli disponibili"}
                                            multiple={true}
                                            options={challengeModels ?? []}
                                            getOptionLabel={(c) => c.name ?? ""}
                                            getOptionValue={(c) => c.name}
                                            loading={challengeModelsLoading}
                                        />
                                        <AutocompleteFormItem
                                            name={`thresholds.${i}.config.activeModels`}
                                            label={"Modelli attivi"}
                                            multiple={true}
                                            options={challengeModels ?? []}
                                            getOptionLabel={(c) => c.name ?? ""}
                                            getOptionValue={(c) => c.name}
                                            loading={challengeModelsLoading}
                                        />
                                    </Stack>
                                </Collapse>
                            </CardContent>
                        </Card>
                    )
                })}
                <Button size={"small"} startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                        onClick={() => thresholds.append({name: "", value: 0, config: emptyConfig()})}>
                    Aggiungi soglia
                </Button>
            </Stack>

            <Stack direction={"row"}
                   sx={{
                       justifyContent: "space-between",
                       alignItems: "center"
                   }}
            >
                <Button href={`/games/${gameId}/levels`} variant={"contained"}>Indietro</Button>
                <Stack direction={"row"} sx={{gap: 2}}>
                    <Button type={"submit"} variant={"contained"}>Salva</Button>
                    <Button type={"reset"} onClick={() => initForm(level)} variant={"outlined"}>Reset</Button>
                </Stack>
            </Stack>
        </Stack>
    </Form>

}
