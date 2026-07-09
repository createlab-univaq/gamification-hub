import {useGame} from "../../components/GameContext.tsx";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {badgeClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../../components/Loading.tsx";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Add, Games} from "@mui/icons-material";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {Chip, Stack, Typography} from "@mui/material";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import type {BadgeCollectionDto} from "../../api/types";
import {useTranslation} from "react-i18next";

export function BadgeListPage() {
    const game = useGame()
    const {setNotification} = useNotificationContext()
    const [deleteBadge, setDeleteBadge] = useState<BadgeCollectionDto>()
    const [search, setSearch] = useState<string>("")
    const [t] = useTranslation()

    const {isLoading, data, error} = useQuery({
        queryKey: ["get-badges", game.id],
        queryFn: () => badgeClient.getBadges(game.id!),
        enabled: !!game
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-badge", game.id],
        mutationFn: (badgeId: string) => badgeClient.deleteBadge(game.id!, badgeId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-badges", game.id]})
            setNotification({
                notification: {
                    type: "success",
                    title: t("badges.saved.title"),
                    content: t("badges.saved.message")
                },
                isSnack: true
            })
            setDeleteBadge(undefined)
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({notification: translateApiErrorToNotification(apiError), isSnack: true})
        }
    })

    const filter = useDebounced((value: string = "") => {
        setSearch(value)
    }, 200)

    if (isLoading) {
        return <Loading fullScreen={true}/>
    }

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={"/dashboard"} replace={true} state={errorMessage}/>
    }

    const collections = (data ?? []).filter(c => (c.name ?? "").toLowerCase().includes(search.toLowerCase()))

    return <PageContainer>
        <PageHeader
            title={t("badges.title")}
            buttons={[
                {
                    children: t("buttons:add"),
                    variant: "contained",
                    endIcon: <Add/>,
                    href: `/games/${game.id}/badges/upsert`
                }
            ]}
            breadcrumbs={[
                {
                    icon:<Games/>,
                    label:t("sidebar.games"),
                    href:"/dashboard"
                },
                {
                    label:game.name ?? "My Game",
                    href:`/games/${game.id}`
                }
            ]}
        />
        <DeleteDialog message={t("delete_message", {entity:deleteBadge?.name})}
                      deleteFn={() => mutate(deleteBadge!.id!)}
                      setElement={setDeleteBadge}
                      element={deleteBadge}
        />
        <PageList
            items={collections}
            itemHref={(i) => `/games/${game.id}/badges/${i.id}`}
            renderItem={(badge) => {
                return <Stack sx={{gap: 1}}>
                    <Typography sx={{fontWeight: "bold", fontSize: "1.2rem"}}>{badge.name}</Typography>
                    <Stack direction={"row"} sx={{gap: 1, flexWrap: "wrap"}}>
                        {(badge.badges ?? []).map(b => <Chip key={b} label={b} size={"small"}/>)}
                    </Stack>
                </Stack>
            }}
            onItemUpdate={(badge, event) => {
                event.stopPropagation()
                event.preventDefault()
                navigateTo(`/games/${game.id}/badges/upsert/${badge.id}`)
            }}
            onItemDelete={(badge) => {
                setDeleteBadge(badge)
            }}
            emptyListMessage={<Typography>{t("badges.empty_list")}</Typography>}
            search={{
                label: t("search_placeholder"),
                placeholder: t("badges.search_placeholder"),
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
