import type {Control, UseFormRegister} from "react-hook-form";
import {useFieldArray, useWatch} from "react-hook-form";
import {Button, Card, CardContent, IconButton, MenuItem, Select, Stack, TextField, Typography} from "@mui/material";
import {Add, Delete} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import type {SimulationFormValues} from "./SimulationForm.tsx";
import {CHALLENGE_STATES} from "../../utils/enum-utils.ts";
import type {ChallengeDto} from "../../api/types";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";

type ChallengeArrayName = "challenges" | "expectedChallenges"

interface ChallengeCardProps {
    index: number
    namePrefix: ChallengeArrayName
    control: Control<SimulationFormValues>
    register: UseFormRegister<SimulationFormValues>
    onRemove: () => void
    challengeModels?: ChallengeDto[]
    challengeModelsLoading?: boolean
}

export function ChallengeCard({
                                  index,
                                  namePrefix,
                                  control,
                                  register,
                                  onRemove,
                                  challengeModels,
                                  challengeModelsLoading
                              }: ChallengeCardProps) {
    const [t] = useTranslation()
    const fields = useFieldArray({control, name: `${namePrefix}.${index}.fields` as "challenges.0.fields"})
    const modelName = useWatch({control, name: `${namePrefix}.${index}.modelName` as "challenges.0.modelName"})
    // A challenge model's variables are the field keys that model expects.
    const variables = challengeModels?.find(m => m.name === modelName)?.variables ?? []

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack sx={{gap: 1}}>
                    <Stack direction="row" sx={{gap: 1, alignItems: "center"}}>
                        <TextField size="small" placeholder="Name" sx={{flex: 2}}
                                   {...register(`${namePrefix}.${index}.name` as "challenges.0.name")}/>
                        <AutocompleteFormItem
                            name={`${namePrefix}.${index}.modelName`}
                            placeholder="Model name"
                            options={challengeModels ?? []}
                            getOptionLabel={(m) => m.name ?? ""}
                            getOptionValue={(m) => m.name}
                            loading={challengeModelsLoading}
                            freeSolo={true}
                            size="small"
                            sx={{flex: 2}}/>
                        <Select size="small" displayEmpty sx={{flex: 1}} defaultValue=""
                                {...register(`${namePrefix}.${index}.state` as "challenges.0.state")}>
                            <MenuItem value=""><em>State</em></MenuItem>
                            {CHALLENGE_STATES.map(s => <MenuItem key={s} value={s}>{t(`enums:${s}`)}</MenuItem>)}
                        </Select>
                        <IconButton size="small" color="error" onClick={onRemove}>
                            <Delete fontSize="small"/>
                        </IconButton>
                    </Stack>

                    {fields.fields.length > 0 && (
                        <Typography variant="caption" color="text.secondary">Fields</Typography>
                    )}
                    {fields.fields.map((field, j) => (
                        <Stack key={field.id} direction="row" sx={{gap: 1, alignItems: "center"}}>
                            <AutocompleteFormItem
                                name={`${namePrefix}.${index}.fields.${j}.key`}
                                placeholder="key"
                                options={variables}
                                getOptionLabel={(v) => v}
                                freeSolo={true}
                                size="small"
                                sx={{flex: 1}}/>
                            <TextField size="small" placeholder="value" sx={{flex: 2}}
                                       {...register(`${namePrefix}.${index}.fields.${j}.value` as "challenges.0.fields.0.value")}/>
                            <IconButton size="small" color="error" onClick={() => fields.remove(j)}>
                                <Delete fontSize="small"/>
                            </IconButton>
                        </Stack>
                    ))}
                    <Button size="small" startIcon={<Add/>} sx={{alignSelf: "flex-start"}}
                            onClick={() => fields.append({key: "", value: ""})}>
                        Add Field
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    )
}