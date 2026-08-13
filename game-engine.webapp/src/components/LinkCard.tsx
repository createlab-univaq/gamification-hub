import type {SxProps} from "@mui/material";
import {Card, CardActionArea, CardContent, CardHeader} from "@mui/material";
import type {ReactNode} from "react";
import {RouterLink} from "./RouterLink.tsx";

interface LinkCardProps {
    href: string,
    title?: ReactNode,
    children?: ReactNode,
    sx?: SxProps,
}

export function LinkCard({href, children, title, sx}: LinkCardProps) {
    return <Card
        sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            "&:hover": {
                cursor: "pointer",
                boxShadow: (theme) => `0rem 0rem 1rem ${theme.palette.background.paper}`
            },
            ...sx
        }}
    >
        <CardActionArea component={RouterLink} href={href}
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            color: "inherit",
                            textDecoration: "none"
                        }}>
            {title && <CardHeader title={title}/>}
            <CardContent sx={{flexGrow: 1, width: "100%", display: "flex", flexDirection: "column"}}>
                {children}
            </CardContent>
        </CardActionArea>
    </Card>
}