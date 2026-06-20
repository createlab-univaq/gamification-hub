import {useQuery} from "@tanstack/react-query";
import {ruleClient} from "../api";
import type {RuleDto} from "../api/types";
import type {GetFilter} from "../api/filters/filters.ts";

export const useGetRules = (params: GetFilter<Omit<RuleDto, "content">>[], options)=>{
    return useQuery({
        ...options,
        queryFn: () => ruleClient.getRules()
    })
}