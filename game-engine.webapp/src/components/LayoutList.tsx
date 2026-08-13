import {Box, Button, Checkbox, Divider, Stack} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import type {ReactNode, SyntheticEvent} from "react";
import {LinkCard} from "./LinkCard.tsx";
import {useTranslation} from "react-i18next";

export type LayoutType = "grid" | "list"

export interface ListSelection<T> {
    isSelected: (i: T) => boolean
    onToggle: (i: T) => void
}

export interface LayoutListProps<T> {
    items: T[],
    layout?: LayoutType
    itemHref: (i: T) => string
    onItemUpdate?: (i: T, event: SyntheticEvent) => void
    onItemDelete?: (i: T, event: SyntheticEvent) => void
    renderItem: (i: T, layout: LayoutType) => ReactNode,
    emptyListMessage?: ReactNode
    selection?: ListSelection<T>
    enableLayout?: boolean
}

export function LayoutList<T>({
                                  layout,
                                  items,
                                  onItemDelete,
                                  renderItem,
                                  itemHref,
                                  onItemUpdate,
                                  emptyListMessage,
                                  selection,
                              }: LayoutListProps<T>) {

    const hasUpdateButton = !!onItemUpdate
    const hasDeleteButton = !!onItemDelete
    const hasButtons = hasUpdateButton || hasDeleteButton
    const hasEmptyListMessage = !!emptyListMessage
    const isGrid = layout === "grid"
    const [t] = useTranslation()

    return <Box sx={{
        display: !isGrid ? "flex" : "grid",
        flexDirection: "column",
        gridTemplateColumns: isGrid
            ? {xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)"}
            : undefined,
        alignItems: "stretch",
        gap: 2,
        py: 2
    }}>
        {items.map((item, i) => {
            const itemElement = renderItem(item, layout ?? "list")
            return <LinkCard
                key={`list-item-${i}`}
                href={itemHref(item)}
                sx={{
                    width: "100%",
                    height: "100%"
                }}
            >
                <Stack
                    direction={!isGrid ? "row" : "column"}
                    divider={<Divider orientation={!isGrid ? "vertical" : "horizontal"}/>}
                    sx={{
                        flexGrow: 1,
                        alignItems: !isGrid ? "center" : "flex-start",
                        justifyContent: !isGrid ? "space-between" : "flex-start",
                    }}
                >
                    <Stack direction={"row"} sx={{
                        width: isGrid ? "100%" : "auto",
                        alignItems: isGrid ? "flex-start" : "center",
                        gap: 1,
                        flexGrow: 1,
                        minWidth: 0
                    }}>
                        {selection &&
                            <Checkbox
                                checked={selection.isSelected(item)}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    selection.onToggle(item)
                                }}
                            />
                        }
                        <Box sx={{minWidth: 0, flexGrow: 1, overflowWrap: "anywhere"}}>
                            {itemElement}
                        </Box>
                    </Stack>
                    {hasButtons &&
                        <Stack
                            direction={"row"}
                            sx={{
                                width: isGrid ? "100%" : "fit-content",
                                justifyContent: "space-between",
                                gap: isGrid ? 1 : 0,
                                mt: isGrid ? 1 : 0,
                                flexShrink: 0
                            }}
                        >
                            {hasUpdateButton &&
                                <Button
                                    variant={isGrid ? "outlined" : "text"}
                                    endIcon={isGrid ? <Edit/> : undefined}
                                    sx={{flex: isGrid ? 1 : "unset"}}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onItemUpdate(item, e)
                                    }}
                                >
                                    {isGrid ? t("buttons:update") : <Edit sx={{fontSize: "2rem"}}/>}
                                </Button>
                            }
                            {hasDeleteButton &&
                                <Button
                                    color={"error"}
                                    variant={isGrid ? "outlined" : "text"}
                                    endIcon={isGrid ? <Delete/> : undefined}
                                    sx={{flex: isGrid ? 1 : "unset"}}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onItemDelete(item, e)
                                    }}
                                >
                                    {isGrid
                                        ? t("buttons:delete")
                                        : <Delete sx={{fontSize: "2rem", color: (theme) => theme.palette.error.main}}/>}
                                </Button>
                            }
                        </Stack>
                    }
                </Stack>
            </LinkCard>
        })}
        {(hasEmptyListMessage && !items.length) && emptyListMessage}
    </Box>

}