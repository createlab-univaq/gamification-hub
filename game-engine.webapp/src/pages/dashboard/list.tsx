import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {Stack, Typography} from "@mui/material";
import {useMutation, useQuery} from "@tanstack/react-query";
import {gameClient, queryClient} from "../../api";
import {Add, Download, Upload} from "@mui/icons-material"
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import type {GameDto} from "../../api/types";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {Loading} from "../../components/Loading.tsx";
import {ImportGameModal} from "../../components/ImportGameModal.tsx";
import {PageList} from "../../components/PageList.tsx";
import {useDebounced} from "../../hooks/use-debounced.ts";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {downloadJson} from "../../utils/download-utils.ts";
import {useTranslation} from "react-i18next";

export function GamesListPage() {

    const {setNotification} = useNotificationContext()
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [deleteGame, setDeleteGame] = useState<GameDto>()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState<string>("")
    const {t} = useTranslation()

    const {isPending, data} = useQuery({
        queryKey: ["get-list"],
        queryFn: () => gameClient.getGames(),
    })

    const {mutate} = useMutation({
        mutationKey: ["delete-game"],
        mutationFn: (gameId) => gameClient.deleteGame(gameId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get-list"]})
            setNotification({
                notification: {
                    type: "success",
                    title: "Game deleted",
                    content: `The game has been successfully deleted`
                },
                isSnack: true
            })
            setDeleteGame(undefined)
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

    const {mutate: exportSelected, isPending: isExporting} = useMutation({
        mutationKey: ["export-games"],
        mutationFn: (ids: string[]) => gameClient.exportGames(ids),
        onSuccess: (games) => {
            downloadJson("games-export.json", games)
            setSelectedIds(new Set())
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

    const toggleSelect = (game: GameDto) => setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(game.id)) next.delete(game.id)
        else next.add(game.id)
        return next
    })

    const filter = useDebounced((value: string = "") => {
        setSearch(value)
    }, 200)

    if (isPending) {
        return <Loading fullScreen={true}/>
    }

    const games = (data ?? []).filter(g => (g.name ?? "").toLowerCase().includes(search.toLowerCase()))

    return <PageContainer>
        <PageHeader title={t("game_list_title")}
                    buttons={[
                        {
                            children: t("buttons:add"),
                            href: "/upsert-game",
                            variant: "contained",
                            endIcon: <Add/>
                        },
                        {
                            children: t("buttons:import"),
                            variant: "contained",
                            endIcon: <Upload/>,
                            onClick: () => setImportModalOpen(true)
                        },
                        {
                            children: `${t("buttons:export")} (${selectedIds.size})`,
                            variant: "outlined",
                            endIcon: <Download/>,
                            disabled: selectedIds.size === 0 || isExporting,
                            loading: isExporting,
                            onClick: () => exportSelected([...selectedIds])
                        }
                    ]}
        />
        <DeleteDialog message={t("delete_message", {entity:deleteGame?.name})}
                      deleteFn={() => mutate(deleteGame.id)}
                      setElement={setDeleteGame}
                      element={deleteGame}
        />
        <ImportGameModal
            open={importModalOpen}
            setOpen={setImportModalOpen}
            onSuccess={(data) => {
                setNotification({
                    notification: {
                        title: "Import successful!",
                        content: `${data.length} were successfully saved.`,
                        type: "success"
                    },
                    isSnack: true
                })
                queryClient.invalidateQueries({queryKey: ["get-list"]})
            }}
            onError={(error) => setNotification(translateApiErrorToNotification(getApiError(error)))}
        />
        <PageList
            items={games}
            itemHref={(game) => `/games/${game.id}`}
            renderItem={(game) => {
                return <Stack>
                    <Typography variant={"h5"}>{game.name}</Typography>
                    <Typography variant={"body1"}>{game.domain}</Typography>
                </Stack>
            }}
            onItemUpdate={(game, event) => {
                event.stopPropagation()
                event.preventDefault()
                navigateTo(`/upsert-game/${game.id}`)
            }}
            onItemDelete={(game) => {
                setDeleteGame(game)
            }}
            selection={{
                isSelected: (game) => selectedIds.has(game.id),
                onToggle: toggleSelect
            }}
            emptyListMessage={<Typography>No games found.</Typography>}
            search={{
                label: t("search_placeholder"),
                placeholder: "Nome...",
                onSearch: (value) => {
                    filter(value)
                }
            }}
        />
    </PageContainer>

}
