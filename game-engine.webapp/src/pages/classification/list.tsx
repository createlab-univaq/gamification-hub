import {useGame} from "../../components/GameContext.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useState} from "react";
import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query";
import {classificationClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add, Games, Leaderboard} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Button, Chip, Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import type {ClassificationDto} from "../../api/types";
import {useTranslation} from "react-i18next";
import type {GetFilter} from "../../api/filters/filters.ts";

export function ClassificationListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteClassification, setDeleteClassification] = useState<ClassificationDto>()
    const [filters, setFilters] = useState<GetFilter<ClassificationDto>[]>([])
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-classifications", game.id, filters],
        queryFn: () => classificationClient.getClassifications(game.id!, filters),
        enabled: !!game,
        placeholderData: keepPreviousData
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-classification", game.id],
        mutationFn: (classificationId: string) => classificationClient.deleteClassification(game.id!, classificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-classifications", game.id, filters]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("leaderboards.deleted.title"),
                    content: t("leaderboards.deleted.content")
                },
                isSnack: true
            })
            setDeleteClassification(undefined)
        },
        onError: (error) => {
            console.error(error)
            setNotification({notification: translateApiErrorToNotification(getApiError(error)), isSnack: true})
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
        <PageHeader
            title={t("leaderboards.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/classifications/upsert`
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
                }
            ]}
        />
        <DeleteDialog
            message={t("delete_message", {entity: deleteClassification?.name})}
            deleteFn={() => mutate(deleteClassification!.id!)}
            setElement={setDeleteClassification}
            element={deleteClassification}
        />
        <PageList
            items={data ?? []}
            itemHref={(i) => `/games/${game.id}/classifications/upsert/${i.id}`}
            renderItem={(classification, layout) => {
                return <Stack
                    sx={{
                        gap: 1,
                        width: layout === "grid" ? "100%" : undefined,
                        flexGrow: layout === "grid" ? 1 : 0,
                        justifyContent: "space-between",
                        height:"100%"
                    }}
                >
                    <Stack sx={{gap:1}}>
                        <Stack direction={"row"} sx={{gap: 1, alignItems: "center", justifyContent: layout === "grid" ? "space-between" : "center"}}>
                            <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{classification.name}</Typography>
                            <Chip size={"small"}
                                  label={classification.type === "INCREMENTAL" ? t("leaderboards.types.incremental") : t("leaderboards.types.general")}
                                  color={classification.type === "INCREMENTAL" ? "secondary" : "primary"}/>
                        </Stack>
                        <Typography>{t("leaderboards.point_concept")}: {classification.pointConceptName}</Typography>
                    </Stack>
                    {classification.type === "INCREMENTAL" &&
                        <Typography>{t("leaderboards.period")}: {classification.periodName}</Typography>}
                    <Button
                        fullWidth={layout==="grid"}
                        size={"small"}
                        variant={"outlined"}
                        startIcon={<Leaderboard/>}
                        sx={{alignSelf: "flex-start"}}
                        href={`/games/${game.id}/classifications/${classification.id}/board`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {t("leaderboards.checkout")}
                    </Button>
                </Stack>
            }}
            onItemUpdate={() => {
            }}
            onItemDelete={(classification) => {
                setDeleteClassification(classification)
            }}
            emptyListMessage={t("leaderboards.empty_list")}
            search={{
                label: t("search_placeholder"),
                placeholder: t("leaderboards.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
