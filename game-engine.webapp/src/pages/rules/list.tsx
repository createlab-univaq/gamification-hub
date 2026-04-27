import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../components/GameContext.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient, ruleClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Button, Stack, Typography} from "@mui/material";
import {LinkCard} from "../../components/LinkCard.tsx";
import {Add, Delete, Edit, PlayArrow} from "@mui/icons-material";
import {useState} from "react";
import type {RuleDto} from "../../api/types";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";

export function RuleListPage() {

    const game = useGame()
    const [deleteRule, setDeleteRule] = useState<RuleDto>()
    const {setNotification} = useNotificationContext()
    const {isLoading, data, error} = useQuery({
        queryKey: ["get-rules", game.id],
        queryFn: () => ruleClient.getRules(game.id),
        enabled: !!game,
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
                        }
                    ]}
        />
        <DeleteDialog message={`Do you want to delete the rule "${deleteRule?.name}" forever?`}
                      deleteFn={() => mutate({gameId: game.id, ruleId: deleteRule.id})}
                      setElement={setDeleteRule}
                      element={deleteRule}
        />
        {!data || !data.length && <Typography>No rules found.</Typography>}
        {data && <Stack sx={{gap: 2, mt: 2}}>
            {data.map((rule) => {
                return <LinkCard key={`game-card-${rule.id}`} title={rule.name}
                                 href={`/games/${rule.gameId}/upsert-rule/${rule.id}`}
                                 sx={{flexDirection:"row"}}
                >
                    <Stack direction={"row"}>
                        <Button><Edit sx={{fontSize: "2rem"}}/></Button>
                        <Button color={"error"} onClick={(event) => {
                            event.stopPropagation()
                            event.preventDefault()
                            //setDeleteGame(rule)
                        }}><Delete
                            sx={{fontSize: "2rem", color: (theme) => theme.palette.error.main}}/></Button>
                    </Stack>
                </LinkCard>
            })}
        </Stack>
        }
    </PageContainer>

}