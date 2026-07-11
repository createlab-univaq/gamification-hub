import type {Control, UseFormRegister} from "react-hook-form";
import {useFieldArray} from "react-hook-form";
import {Button, Card, CardContent, IconButton, MenuItem, Select, Stack, TextField, Typography} from "@mui/material";
import {Add, Delete} from "@mui/icons-material";
import type {SimulationFormValues} from "./SimulationForm.tsx";

type ChallengeArrayName = "challenges" | "expectedChallenges"

interface ChallengeCardProps {
    index: number
    namePrefix: ChallengeArrayName
    control: Control<SimulationFormValues>
    register: UseFormRegister<SimulationFormValues>
    onRemove: () => void
}

const CHALLENGE_STATES = ["PROPOSED", "ASSIGNED", "ACTIVE", "COMPLETED", "FAILED", "REFUSED", "AUTO_DISCARDED", "CANCELED"];

export function ChallengeCard({index, namePrefix, control, register, onRemove}: ChallengeCardProps) {
    const fields = useFieldArray({control, name: `${namePrefix}.${index}.fields` as "challenges.0.fields"})

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack sx={{gap: 1}}>
                    <Stack direction="row" sx={{gap: 1, alignItems: "center"}}>
                        <TextField size="small" placeholder="Name" sx={{flex: 2}}
                                   {...register(`${namePrefix}.${index}.name` as "challenges.0.name")}/>
                        <TextField size="small" placeholder="Model name" sx={{flex: 2}}
                                   {...register(`${namePrefix}.${index}.modelName` as "challenges.0.modelName")}/>
                        <Select size="small" displayEmpty sx={{flex: 1}} defaultValue=""
                                {...register(`${namePrefix}.${index}.state` as "challenges.0.state")}>
                            <MenuItem value=""><em>State</em></MenuItem>
                            {CHALLENGE_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
                            <TextField size="small" placeholder="key" sx={{flex: 1}}
                                       {...register(`${namePrefix}.${index}.fields.${j}.key` as "challenges.0.fields.0.key")}/>
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