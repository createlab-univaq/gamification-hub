import {useState} from "react";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {playerClient} from "../../api";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {useTranslation} from "react-i18next";
import {AutocompleteFormItem} from "./AutocompleteFormItem.tsx";

interface PlayersAutocompleteProps {
    name: string
    gameId: string
    label?: string
}

export function PlayersAutocomplete({name, gameId, label}: PlayersAutocompleteProps) {
    const [search, setSearch] = useState("")
    const [t] = useTranslation();

    const {data, isFetching} = useQuery({
        queryKey: ["players-search", gameId, search],
        queryFn: () => playerClient.getPlayers(gameId, search ? [{name: "playerId", value: search}] : []),
        enabled: !!gameId,
        placeholderData: keepPreviousData
    })

    const onSearch = useDebounced((value: string) => setSearch(value), 250)

    const found = (data?.content ?? [])
        .map(p => p.playerId)
        .filter((id): id is string => !!id)

    return <AutocompleteFormItem<string>
        name={name}
        options={found}
        getOptionLabel={(player) => player}
        getOptionValue={(player) => player}
        label={label}
        placeholder={t("search_placeholder")}
        loading={isFetching}
        multiple={true}
        filterSelectedOptions={true}
        onInputChange={onSearch}
    />
}
