import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useMutation, useQuery} from "@tanstack/react-query";
import {groupChallengeClient, playerBlackListClient, playerChallengeClient, playerClient, playerInventoryClient, queryClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Box, Button, Card, CardContent, Chip, Stack, Typography} from "@mui/material";
import {Add, Block, Bolt, Check, Close, Delete, Edit, Games, Groups, People, PlayArrow} from "@mui/icons-material";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {ChallengeAssignForm} from "../../components/form/ChallengeAssignForm.tsx";
import {ChallengeEditForm} from "../../components/form/ChallengeEditForm.tsx";
import {GroupChallengeInviteForm} from "../../components/form/GroupChallengeInviteForm.tsx";
import {BlockPlayerForm} from "../../components/form/BlockPlayerForm.tsx";
import {useState} from "react";
import type {ChallengeConceptDto, GroupChallengeDto, PlayerStateDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {type ChallengeState, ChallengeStateChipColorRecord} from "../../utils/enum-utils.ts";
import {formatDate} from "../../utils/date-utils.ts";

type ActionVars = {
    run: () => Promise<unknown>
    invalidate: unknown[]
    title: string
    content: string
}

export function PlayerDetailsPage() {

    const game = useGame()
    const {playerId} = useParams()
    const {setNotification} = useNotificationContext()
    const [t] = useTranslation()
    const [deletePlayerItem, setDeletePlayerItem] = useState<PlayerStateDto>()
    const [deleteChallengeItem, setDeleteChallengeItem] = useState<ChallengeConceptDto>()
    const [editChallengeItem, setEditChallengeItem] = useState<ChallengeConceptDto>()
    const [assignOpen, setAssignOpen] = useState(false)
    const [inviteOpen, setInviteOpen] = useState(false)
    const [blockOpen, setBlockOpen] = useState(false)

    const invalidate = ["get-player", game.id, playerId]

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-player", game.id, playerId],
        queryFn: () => playerClient.getPlayer(game.id!, playerId!),
        enabled: !!game && !!playerId
    })

    const {data: blackList} = useQuery({
        queryKey: ["get-blacklist", game.id, playerId],
        queryFn: () => playerBlackListClient.getBlackList(game.id!, playerId!),
        enabled: !!game && !!playerId
    })

    const {mutate: deletePlayer, isPending: isDeletingPlayer} = useMutation({
        mutationKey: ["delete-player", playerId],
        mutationFn: () => playerClient.deletePlayer(game.id!, playerId!),
        onSuccess: () => {
            navigateTo(`/games/${game.id}/players`, {
                state: {
                    type: "success",
                    title: t("players.deleted.title"),
                    content: t("players.deleted.title")
                }
            })
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
        }
    })

    const action = useMutation({
        mutationFn: (vars: ActionVars) => vars.run(),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({queryKey: vars.invalidate})
            setNotification({notification: {type: "success", title: vars.title, content: vars.content}, isSnack: true})
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
        }
    })

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    const pointConcepts = data?.pointConcepts ?? []
    const badges = data?.badgeCollections ?? []
    const challenges = data?.challenges ?? []
    const inventory = data?.inventory
    const choices = inventory?.challengeChoices ?? []
    const groups = data?.groupChallenges ?? []
    const blockedPlayers = blackList?.blockedPlayers ?? []

    function roleOf(gc: GroupChallengeDto): string | undefined {
        return (gc.attendees ?? []).find(a => a.playerId === playerId)?.role
    }

    return <PageContainer>
        <DeleteDialog message={t("delete_message", {entity: data?.playerId})}
                      deleteFn={() => deletePlayer()}
                      setElement={setDeletePlayerItem}
                      element={deletePlayerItem}
        />
        <DeleteDialog message={t("delete_message", {entity: deleteChallengeItem?.name})}
                      deleteFn={() => {
                          const name = deleteChallengeItem!.name!
                          action.mutate({
                              run: () => playerChallengeClient.deleteChallenge(game.id!, playerId!, name),
                              invalidate: invalidate,
                              title: t("challenges.deleted.title"),
                              content: t("challenges.deleted.message")
                          })
                          setDeleteChallengeItem(undefined)
                      }}
                      setElement={setDeleteChallengeItem}
                      element={deleteChallengeItem}
        />
        <ChallengeAssignForm gameId={game.id!} playerId={playerId!} open={assignOpen}
                             onClose={() => setAssignOpen(false)}/>
        <ChallengeEditForm gameId={game.id!} playerId={playerId!} challenge={editChallengeItem}
                           onClose={() => setEditChallengeItem(undefined)}/>
        <GroupChallengeInviteForm gameId={game.id!} playerId={playerId!} open={inviteOpen}
                                  onClose={() => setInviteOpen(false)}/>
        <BlockPlayerForm gameId={game.id!} playerId={playerId!} excludedIds={[playerId!, ...blockedPlayers]}
                         open={blockOpen} onClose={() => setBlockOpen(false)}/>

        <PageHeader
            title={data?.playerId}
            buttons={[
                {
                    disabled: isDeletingPlayer,
                    loading: isDeletingPlayer,
                    children: t("buttons:delete"),
                    color: "error",
                    variant: "contained",
                    endIcon: <Delete/>,
                    onClick: () => setDeletePlayerItem(data)
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
                    label: t("sidebar.players"),
                    icon: <People/>,
                    href: `/games/${game.id}/players`
                }
            ]}
        />
        <Stack sx={{gap: 3, py: 2}}>
            <Stack sx={{gap: 1}}>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>{t("sidebar.points")}</Typography>
                {pointConcepts.length
                    ? <Stack direction={"row"} sx={{gap: 2, flexWrap: "wrap"}}>
                        {pointConcepts.map(pc => (
                            <Card key={`pc-${pc.name}`} variant={"outlined"}>
                                <CardContent sx={{minWidth: "6rem"}}>
                                    <Typography sx={{fontWeight: "bold"}}>{pc.name}</Typography>
                                    <Typography variant={"h5"}>{pc.score ?? 0}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>{t("points.empty_list")}</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>{t("sidebar.badges")}</Typography>
                {badges.length
                    ? <Stack sx={{gap: 1}}>
                        {badges.map(b => (
                            <Card key={`badge-${b.name}`} variant={"outlined"}>
                                <CardContent>
                                    <Typography sx={{fontWeight: "bold"}}>{b.name}</Typography>
                                    <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap", mt: 1}}>
                                        {(b.badges ?? []).map(badge => <Chip key={badge} label={badge}
                                                                             size={"small"}/>)}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>{t("badges.empty_list")}</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant={"subtitle1"} sx={{fontWeight: 600}}>{t("sidebar.challenges")}</Typography>
                    <Button size={"small"} variant={"contained"} startIcon={<Add/>}
                            onClick={() => setAssignOpen(true)}>{t("buttons:assign")}</Button>
                </Stack>
                {challenges.length
                    ? <Stack sx={{gap: 1}}>
                        {challenges.map((c, i) => (
                            <Card key={`ch-${c.name}-${i}`} variant={"outlined"}>
                                <CardContent>
                                    <Stack direction={"row"} sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 2,
                                        flexWrap: "wrap"
                                    }}>
                                        <Box>
                                            <Stack direction={"row"} sx={{gap: 1}}>
                                                <Typography sx={{fontWeight: "bold"}}>
                                                    {c.name}
                                                </Typography>
                                                <Chip
                                                    sx={{
                                                        backgroundColor: ChallengeStateChipColorRecord[c.state as ChallengeState]
                                                    }}
                                                    label={t(`enums:${c.state}`)}
                                                    size={"small"}
                                                />
                                            </Stack>
                                            <Typography color={"text.secondary"}>
                                                {c.modelName}
                                            </Typography>
                                            <Typography>
                                                {formatDate(c.start ?? "")} - {formatDate(c.end ?? "")}
                                            </Typography>
                                        </Box>
                                        <Stack direction={"row"} sx={{gap: 1}}>
                                            {c.state === "PROPOSED" &&
                                                <Button size={"small"} variant={"outlined"}
                                                        startIcon={<Check/>}
                                                        color={"success"}
                                                        onClick={() => action.mutate({
                                                            run: () => playerChallengeClient.acceptChallenge(game.id!, playerId!, c.name!),
                                                            invalidate: invalidate,
                                                            title: t("players.challenges.accepted.title"),
                                                            content: t("players.challenges.accepted.message")
                                                        })}>{t("buttons:accept")}</Button>
                                            }
                                            <Button size={"small"} variant={"outlined"} startIcon={<Edit/>}
                                                    onClick={() => setEditChallengeItem(c)}>{t("buttons:update")}</Button>
                                            <Button size={"small"} variant={"outlined"} color={"error"}
                                                    startIcon={<Delete/>}
                                                    onClick={() => setDeleteChallengeItem(c)}>{t("buttons:delete")}</Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>{t("challenges.empty_list")}</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant={"subtitle1"}
                                sx={{fontWeight: 600}}>{t("players.inventories.title")}</Typography>
                    <Button size={"small"} variant={"outlined"} startIcon={<Bolt/>}
                            disabled={(inventory?.challengeActivationActions ?? 0) === 0}
                            onClick={() => action.mutate({
                                run: () => playerChallengeClient.forceChoice(game.id!, playerId!),
                                invalidate: invalidate,
                                title: t("players.inventories.choices.forced.title"),
                                content: t("players.inventories.choices.forced.message")
                            })}>{t("buttons:force")}</Button>
                </Stack>
                <Typography color={"text.secondary"} variant={"body2"}>
                    {t("players.inventories.available_choices", {count: inventory?.challengeActivationActions ?? 0})}
                </Typography>
                {choices.length
                    ? <Stack sx={{gap: 1}}>
                        {choices.map((choice, i) => (
                            <Card key={`choice-${choice.modelName}-${i}`} variant={"outlined"}>
                                <CardContent>
                                    <Stack direction={"row"}
                                           sx={{justifyContent: "space-between", alignItems: "center", gap: 2}}>
                                        <Box>
                                            <Typography sx={{fontWeight: "bold"}}>{choice.modelName}</Typography>
                                            <Typography color={"text.secondary"}>{t(`enums:${choice.state}`)}</Typography>
                                        </Box>
                                        {choice.state === "AVAILABLE" &&
                                            <Button size={"small"} variant={"outlined"} startIcon={<PlayArrow/>}
                                                    onClick={() => action.mutate({
                                                        run: () => playerInventoryClient.activateChoice(game.id!, playerId!, {
                                                            type: "CHALLENGE_MODEL",
                                                            name: choice.modelName
                                                        }),
                                                        invalidate: invalidate,
                                                        title: t("players.inventories.choices.activated.title"),
                                                        content: t("players.inventories.choices.activated.title")
                                                    })}>{t("buttons:activate")}</Button>
                                        }
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>{t("players.inventories.choices.empty_list")}</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant={"subtitle1"}
                                sx={{fontWeight: 600}}>{t("players.groups.challenges.title")}</Typography>
                    <Button size={"small"} variant={"contained"} startIcon={<Groups/>}
                            onClick={() => setInviteOpen(true)}>{t("buttons:invite")}</Button>
                </Stack>
                {groups.length
                    ? <Stack sx={{gap: 1}}>
                        {groups.map((gc, i) => {
                            const role = roleOf(gc)
                            return <Card key={`gc-${gc.instanceName}-${i}`} variant={"outlined"}>
                                <CardContent>
                                    <Stack direction={"row"} sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 2,
                                        flexWrap: "wrap"
                                    }}>
                                        <Box>
                                            <Typography sx={{fontWeight: "bold"}}>{gc.challengeModel}</Typography>
                                            <Typography
                                                color={"text.secondary"}>{gc.instanceName} - {t(`enums:${gc.state}`)}</Typography>
                                            <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap", mt: 1}}>
                                                {(gc.attendees ?? []).map(a =>
                                                    <Chip key={a.playerId} size={"small"}
                                                          label={`${a.playerId} (${t(`enums:${a.role}`)})`}/>)}
                                            </Stack>
                                        </Box>
                                        {gc.state === "PROPOSED" &&
                                            <Stack direction={"row"} sx={{gap: 1}}>
                                                {role === "GUEST" &&
                                                    <>
                                                        <Button size={"small"} variant={"outlined"} color={"success"}
                                                                startIcon={<Check/>}
                                                                onClick={() => action.mutate({
                                                                    run: () => groupChallengeClient.acceptInvitation(game.id!, playerId!, gc.instanceName!),
                                                                    invalidate: invalidate,
                                                                    title: t("players.groups.challenges.invites.accepted.title"),
                                                                    content: t("players.groups.challenges.invites.accepted.message")
                                                                })}>{t("buttons:accept")}</Button>
                                                        <Button size={"small"} variant={"outlined"} color={"error"}
                                                                startIcon={<Close/>}
                                                                onClick={() => action.mutate({
                                                                    run: () => groupChallengeClient.refuseInvitation(game.id!, playerId!, gc.instanceName!),
                                                                    invalidate: invalidate,
                                                                    title: t("players.groups.challenges.invites.denied.title"),
                                                                    content: t("players.groups.challenges.invites.denied.title")
                                                                })}>{t("buttons:deny")}</Button>
                                                    </>
                                                }
                                                {role === "PROPOSER" &&
                                                    <Button size={"small"} variant={"outlined"} color={"error"}
                                                            startIcon={<Close/>}
                                                            onClick={() => action.mutate({
                                                                run: () => groupChallengeClient.cancelInvitation(game.id!, playerId!, gc.instanceName!),
                                                                invalidate: invalidate,
                                                                title: t("players.groups.challenges.invites.cancelled.title"),
                                                                content: t("players.groups.challenges.invites.cancelled.title")
                                                            })}>{t("buttons:cancel")}</Button>
                                                }
                                            </Stack>
                                        }
                                    </Stack>
                                </CardContent>
                            </Card>
                        })}
                    </Stack>
                    : <Typography color={"text.secondary"}>{t("players.groups.challenges.empty_list")}</Typography>}
            </Stack>

            <Stack sx={{gap: 1}}>
                <Stack direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant={"subtitle1"}
                                sx={{fontWeight: 600}}>{t("players.blacklist.title")}</Typography>
                    <Button size={"small"} variant={"contained"} startIcon={<Block/>}
                            onClick={() => setBlockOpen(true)}>{t("buttons:block")}</Button>
                </Stack>
                {blockedPlayers.length
                    ? <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap"}}>
                        {blockedPlayers.map(otherPlayerId => (
                            <Chip key={`blocked-${otherPlayerId}`}
                                  label={otherPlayerId}
                                  onDelete={() => action.mutate({
                                      run: () => playerBlackListClient.unblockPlayer(game.id!, playerId!, otherPlayerId),
                                      invalidate: ["get-blacklist", game.id, playerId],
                                      title: t("players.blacklist.unblocked.title"),
                                      content: t("players.blacklist.unblocked.message")
                                  })}
                            />
                        ))}
                    </Stack>
                    : <Typography color={"text.secondary"}>{t("players.blacklist.empty_list")}</Typography>}
            </Stack>
        </Stack>
    </PageContainer>

}
