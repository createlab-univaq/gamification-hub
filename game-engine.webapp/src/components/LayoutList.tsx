import {Box, Button, Checkbox, Divider, Stack} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import type {ReactElement} from "react";
import {LinkCard} from "./LinkCard.tsx";

type LayoutType = "grid" | "list"

export interface ListSelection<T> {
    isSelected: (i: T) => boolean
    onToggle: (i: T) => void
}

export interface LayoutListProps<T> {
    items: T[],
    layout?: LayoutType
    itemHref: (i: T) => string
    onItemUpdate?: (i: T, event: Event) => void
    onItemDelete?: (i: T, event: Event) => void
    renderItem: (i: T) => ReactElement,
    emptyListMessage?:ReactElement
    selection?: ListSelection<T>
}

export function LayoutList<T>({layout, items, onItemDelete, renderItem, itemHref, onItemUpdate, emptyListMessage, selection}: LayoutListProps<T>) {

    const hasUpdateButton = !!onItemUpdate
    const hasDeleteButton = !!onItemDelete
    const hasButtons = hasUpdateButton || hasDeleteButton
    const hasEmptyListMessage = !!emptyListMessage

    return <Box sx={{
        display: layout === "list" ? "flex" : "grid",
        flexDirection: "column",
        gridTemplateColumns: layout === "grid"
            ? {xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)"}
            : undefined,
        alignItems: "stretch",
        gap: 2,
        py: 2
    }}>
        {items.map((item, i) => {
            const itemElement = renderItem(item)
            return <LinkCard
                key={`list-item-${i}`}
                href={itemHref(item)}
                sx={{
                    width: "100%",
                    height: "100%"
                }}
            >
                <Stack
                    direction={layout === "list" ? "row" : "column"}
                    divider={<Divider orientation={layout==="list" ? "vertical" : "horizontal"}/>}
                    sx={{
                        alignItems: layout === "list" ? "center" : "flex-start",
                        justifyContent: layout === "list" ? "space-between" : "center",
                    }}
                >
                    <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
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
                        {itemElement}
                    </Stack>
                    {hasButtons &&
                        <Stack
                            direction={"row"}
                            sx={{
                                width: layout==="grid" ? "100%" : "fit-content",
                                justifyContent:"space-between"
                            }}
                        >
                            {hasUpdateButton &&
                                <Button
                                    onClick={(e) => {
                                        onItemUpdate(item, e)
                                    }}
                                >
                                    <Edit sx={{fontSize: "2rem"}}/>
                                </Button>
                            }
                            {hasDeleteButton &&
                                <Button
                                    color={"error"}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onItemDelete(item, e)
                                    }}
                                >
                                    <Delete sx={{fontSize: "2rem", color: (theme) => theme.palette.error.main}}/>
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