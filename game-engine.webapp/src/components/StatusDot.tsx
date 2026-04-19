import {Box, Stack, Tooltip} from "@mui/material";

interface StatusDotProps {
    type?: "normal" | "warning" | "success" | "error",
    title?: string
    size?: number | string
}

export function StatusDot({type, title, size}: StatusDotProps) {
    return <Tooltip title={title}>
        <Stack
            sx={{
                display:"inline-block",
                width: size ?? "1rem",
                height: size ?? "1rem",
                borderRadius: "50%",
                backgroundColor: (theme) => {
                    switch (type) {
                        case "warning":
                            return theme.palette.warning.main
                        case "error":
                            return theme.palette.error.main
                        case "success":
                            return theme.palette.success.main
                        default:
                            return theme.palette.divider
                    }
                }
            }}
        />
    </Tooltip>
}