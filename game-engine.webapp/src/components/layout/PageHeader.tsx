import type {ButtonProps} from "@mui/material"
import {Box, Button, Stack, Typography} from "@mui/material";
import type {ReactElement} from "react";

export interface PageHeaderProps {
    title?: ReactElement
    subTitle?: ReactElement
    buttons?: ButtonProps[]
    children?:ReactElement
}

export function PageHeader({buttons, subTitle, title}:PageHeaderProps) {

    const Title = typeof title === "string" ? <Typography variant={"h4"}>{title}</Typography> : title
    const SubTitle = typeof subTitle === "string" ? <Typography variant={"body1"}>{subTitle}</Typography> : subTitle

    return <Stack>
        <Stack direction={"row"} sx={{gap:2, justifyContent:"space-between", alignItems:"center"}}>
            {Title}
            <Stack direction={"row"} sx={{gap:2}}>
                {buttons?.map((b, index)=><Button {...b} key={`page-header-btn-${index}`}/>)}
            </Stack>
        </Stack>
        {SubTitle}
    </Stack>

}