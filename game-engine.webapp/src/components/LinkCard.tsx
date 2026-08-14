import type {SxProps} from "@mui/material";
import {Box, Card, CardActionArea, CardContent, CardHeader} from "@mui/material";
import type {ReactNode} from "react";
import {RouterLink} from "./RouterLink.tsx";

interface LinkCardProps {
    // Empty when the card is not navigable, in which case it renders as plain content.
    href: string,
    title?: ReactNode,
    children?: ReactNode,
    sx?: SxProps,
}

const BODY_SX = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    color: "inherit",
    textDecoration: "none"
}

export function LinkCard({href, children, title, sx}: LinkCardProps) {

    const body = <>
        {title && <CardHeader title={title}/>}
        <CardContent sx={{flexGrow: 1, width: "100%", display: "flex", flexDirection: "column"}}>
            {children}
        </CardContent>
    </>

    return <Card
        sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            ...(href ? {
                "&:hover": {
                    cursor: "pointer",
                    boxShadow: (theme) => `0rem 0rem 1rem ${theme.palette.background.paper}`
                }
            } : {}),
            ...sx
        }}
    >
        {href
            ? <CardActionArea component={RouterLink} href={href} sx={BODY_SX}>{body}</CardActionArea>
            : <Box sx={BODY_SX}>{body}</Box>}
    </Card>
}
