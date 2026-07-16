import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useGame} from "../../hooks/use-game";
import {Navigate, useParams} from "react-router-dom";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {useMutation, useQuery} from "@tanstack/react-query";
import {pointConceptClient} from "../../api";
import {Loading} from "../../components/Loading.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Divider, Stack, Typography} from "@mui/material";
import {Delete, Edit, Games, Stars} from "@mui/icons-material";
import {formatDate, formatMilliseconds} from "../../utils/date-utils.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {PointConceptDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import {PageList} from "../../components/PageList.tsx";

export function PointConceptDetailsPage() {

    const game = useGame()
    const {pcId} = useParams()
    const {setNotification} = useNotificationContext()
    const [deleteElement, setDeleteElement] = useState<PointConceptDto>()
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-pc", pcId],
        queryFn: () => pointConceptClient.getPointConcept(game.id!, pcId!),
        enabled: !!game && !!pcId
    })

    const {mutate, isPending} = useMutation<unknown, Error, { gameId: string, pcId: string }>({
        mutationKey: ["delete-pc", pcId],
        mutationFn: ({gameId, pcId}) => pointConceptClient.deletePointConcept(gameId, pcId),
        onSuccess: () => {
            navigateTo(`/games/${game.id}/points`, {
                state: {
                    type: "success",
                    title: t("points.deleted.title"),
                    content: t("points.deleted.message")
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

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <DeleteDialog message={t("delete_message", {entity: data?.name})}
                      deleteFn={() => mutate({gameId: game.id!, pcId: pcId!})}
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
                    href: `/games/${game.id}/points/upsert/${pcId}`,
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
                    icon: <Stars/>,
                    label: t("sidebar.points"),
                    href: `/games/${game.id}`
                }
            ]}
        />
        <PageList
            items={Array.from(Object.values(data!.periods!))}
            itemHref={() => ""}
            renderItem={(period) => {
                return <Stack sx={{gap: 1}} divider={<Divider/>}>
                    <Typography variant={"h5"}>{period.identifier}</Typography>
                    <Stack sx={{gap: 2}}>
                        <Typography>{t("points.details.validity")}: <b>{formatDate(period.start!)}</b> — <b>{formatDate(period.end!)}</b></Typography>
                        <Typography><b>{t("points.details.duration")}:</b> {formatMilliseconds(period.period!)}
                        </Typography>
                        <Typography><b>{t("points.details.kept_instances")}:</b> {period.capacity}</Typography>
                    </Stack>
                </Stack>
            }}
            enableLayout={true}
            emptyListMessage={t("points.details.no_periods")}
        />
    </PageContainer>

}