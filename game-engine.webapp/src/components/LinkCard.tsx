import type {SxProps} from "@mui/material";
import {Card, CardActionArea, CardContent, CardHeader} from "@mui/material";
import type {ReactElement} from "react";
import {navigateTo} from "../utils/navigation-utils.ts";

interface LinkCardProps {
    href: string,
    title?: ReactElement,
    children?: ReactElement,
    sx?: SxProps,
}

export function LinkCard({href, children, title, sx}: LinkCardProps) {
    return <Card
        sx={{
            width: "100%",
            "&:hover": {
                cursor: "pointer",
                boxShadow: (theme) => `0rem 0rem 1rem ${theme.palette.background.secondary}`
            },
            ...sx
        }}
    >
        <CardActionArea onClick={()=>navigateTo(href)} component={"div"}>
            {title && <CardHeader title={title}/>}
            <CardContent>
                {children}
            </CardContent>
        </CardActionArea>
    </Card>
}