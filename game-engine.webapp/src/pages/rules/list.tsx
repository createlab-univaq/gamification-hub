import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../components/GameContext.tsx";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {queryClient, ruleClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Typography} from "@mui/material";
import {AccountTree, Add} from "@mui/icons-material";
import {useState} from "react";
import type {RuleDto} from "../../api/types";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {PageList} from "../../components/PageList.tsx";
import type {GetFilter} from "../../api/filters/filters.ts";
import {useDebounced} from "../../hooks/use-debounced.ts";

export function RuleListPage() {

    const game = useGame()
    const [deleteRule, setDeleteRule] = useState<RuleDto>()
    const {setNotification} = useNotificationContext()
    const [filters, setFilters] = useState<GetFilter<Omit<RuleDto, "content">>[]>([])
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-rules", game.id, filters],
        queryFn: () => {
            return ruleClient.getRules(game.id, filters)
        },
        enabled: !!game,
        placeholderData: keepPreviousData
    })
    const {mutate} = useMutation({
        mutationKey: ["delete-rule"],
        mutationFn: (vars) => ruleClient.deleteRule(vars.gameId, vars.ruleId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-rules", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Rule deleted",
                    content: `The rule has been successfully deleted`
                },
                isSnack: true
            })
            setDeleteRule(undefined)
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

    const filter = useDebounced((value: string = "") => {
        setFilters(value ? [{name: "name", value}] : [])
    }, 200)

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <PageHeader title={"Available Rules"}
                    buttons={[
                        {
                            children: "Add",
                            href: `/games/${game.id}/upsert-rule`,
                            variant: "contained",
                            endIcon: <Add/>
                        },
                        {
                            children: "Static Analysis",
                            variant: "contained",
                            href: `/games/${game.id}/impact-analysis`,
                            endIcon: <AccountTree/>
                        }
                    ]}
        />
        <DeleteDialog message={`Do you want to delete the rule "${deleteRule?.name}" forever?`}
                      deleteFn={() => mutate({gameId: game.id, ruleId: deleteRule.id})}
                      setElement={setDeleteRule}
                      element={deleteRule}
        />
        <PageList
            items={data ?? []}
            itemHref={(rule) => {
                return `/games/${rule.gameId}/upsert-rule/${rule.id}`
            }}
            renderItem={(rule) => {
                return <Typography variant={"h5"}>{rule.name}</Typography>
            }}
            onItemUpdate={() => {
            }}
            onItemDelete={(rule) => {
                setDeleteRule(rule)
            }}
            emptyListMessage={"Nessuna regola trovata"}
            search={{
                label: "Cerca",
                placeholder: "Regola...",
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}