import type {LayoutListProps} from "./LayoutList.tsx";
import {LayoutList} from "./LayoutList.tsx";
import {Divider, IconButton, Stack, TextField} from "@mui/material";
import {GridOn, List} from "@mui/icons-material";
import {useState} from "react";

interface SearchProps {
    label?: string
    placeholder?: string
    onSearch?: (value: string, e: Event) => void
}

interface PageListProps<T> extends Omit<LayoutListProps<T>, "layout"> {
    search?: SearchProps
}

export function PageList<T>({search, ...props}: PageListProps<T>) {

    const [layout, setLayout] = useState("list")

    return <Stack sx={{py:2}}>
        <Stack
            direction={"row"}
            sx={{
                justifyContent: "space-between"
            }}
        >
            <TextField
                type={"text"}
                label={search.label}
                placeholder={search.placeholder}
                sx={{
                    minWidth: "30%"
                }}
                onChange={(e) => {
                    search?.onSearch?.(e.target.value, e)
                }}
            />
            <Stack direction={"row"} divider={<Divider orientation={"vertical"}/>}>
                <IconButton
                    color={layout === "list" ? "primary" : "text"}
                    size={"small"}
                    sx={{
                        "&:hover":{
                            backgroundColor:"unset"
                        }
                    }}
                    onClick={() => setLayout("list")}
                >
                    <List/>
                </IconButton>
                <IconButton
                    size={"small"}
                    color={layout === "grid" ? "primary" : "text"}
                    sx={{
                        "&:hover":{
                            backgroundColor:"unset"
                        }
                    }}
                    onClick={() => setLayout("grid")}
                >
                    <GridOn/>
                </IconButton>
            </Stack>
        </Stack>
        <LayoutList {...props} layout={layout}/>
    </Stack>
}