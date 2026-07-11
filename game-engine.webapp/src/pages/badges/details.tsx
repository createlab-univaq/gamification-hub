import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useMutation, useQuery} from "@tanstack/react-query";
import {badgeClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Card, CardContent, CardHeader, Chip, Stack, Typography} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {BadgeCollectionDto} from "../../api/types";
import {useTranslation} from "react-i18next";

export function BadgeDetailsPage() {

    const game = useGame()
    const {badgeId} = useParams()
    const {setNotification} = useNotificationContext()
    const [deleteElement, setDeleteElement] = useState<BadgeCollectionDto>()
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-badge", game.id, badgeId],
        queryFn: () => badgeClient.getBadge(game.id!, badgeId!),
        enabled: !!game && !!badgeId
    })

    const {mutate, isPending} = useMutation<unknown, Error, { gameId: string, badgeId: string }>({
        mutationKey: ["delete-badge", badgeId],
        mutationFn: (vars) => badgeClient.deleteBadge(vars.gameId, vars.badgeId),
        onSuccess: () => {
            navigateTo(`/games/${game.id}/badges`, {
                state: {
                    type: "success",
                    title: "Collezione eliminata",
                    content: `Collezione di medaglie eliminata con successo!`
                }
            })
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
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
        <DeleteDialog message={t("delete_message", {entity: data?.name})}
                      deleteFn={() => mutate({gameId: game.id!, badgeId: badgeId!})}
                      setElement={setDeleteElement}
                      element={deleteElement}
        />
        <PageHeader
            title={data?.name}
            buttons={[
                {
                    disabled: isPending,
                    loading: isPending,
                    children: t("buttons:update"),
                    variant: "contained",
                    href: `/games/${game.id}/badges/upsert/${badgeId}`,
                    endIcon: <Edit/>
                },
                {
                    disabled: isPending,
                    loading: isPending,
                    children: t("buttons:delete"),
                    color: "error",
                    variant: "contained",
                    endIcon: <Delete/>,
                    onClick: () => setDeleteElement(data)
                }
            ]}
        />
        <Stack sx={{gap: 2, py: 2}}>
            <Typography><b>{t("badges.visibility.label")}</b> {data?.hidden ? t("badges.visibility.hidden") : t("badges.visibility.visibile")}
            </Typography>
            <Card>
                <CardHeader title={`${t("sidebar.badges")} (${data?.badges?.length ?? 0})`}/>
                <CardContent>
                    <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap"}}>
                        {(data?.badges ?? []).map(b => <Chip key={b} label={b}/>)}
                        {!(data?.badges ?? []).length && <Typography>{t("badges.empty_list")}</Typography>}
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    </PageContainer>

}
