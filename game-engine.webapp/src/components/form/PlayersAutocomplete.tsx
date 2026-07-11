import {Autocomplete, TextField} from "@mui/material";
import {Controller, useFormContext} from "react-hook-form";
import {useState} from "react";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {playerClient} from "../../api";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {useTranslation} from "react-i18next";

interface PlayersAutocompleteProps {
    name: string
    gameId: string
    label?: string
}

export function PlayersAutocomplete({name, gameId, label}: PlayersAutocompleteProps) {
    const {control} = useFormContext()
    const [search, setSearch] = useState("")
    const [t] = useTranslation();

    const {data, isFetching} = useQuery({
        queryKey: ["players-search", gameId, search],
        queryFn: () => playerClient.getPlayers(gameId, search ? [{name: "playerId", value: search}] : []),
        enabled: !!gameId,
        placeholderData: keepPreviousData
    })

    const onSearch = useDebounced((value: string = "") => setSearch(value), 250)

    const found = (data?.content ?? [])
        .map(p => p.playerId)
        .filter((id): id is string => !!id)

    return <Controller
        name={name}
        control={control}
        render={({field}) => {
            const value: string[] = field.value ?? []
            const options = Array.from(new Set([...value, ...found]))
            return <Autocomplete
                multiple
                options={options}
                value={value}
                loading={isFetching}
                filterSelectedOptions
                onChange={(_, newValue) => field.onChange(newValue)}
                onInputChange={(_, input, reason) => {
                    if (reason === "input") {
                        onSearch(input)
                    }
                }}
                isOptionEqualToValue={(opt, val) => opt === val}
                renderInput={(params) => (
                    <TextField {...params} label={label} placeholder={t("search_placeholder")} onBlur={field.onBlur}/>
                )}
            />
        }}
    />
}
