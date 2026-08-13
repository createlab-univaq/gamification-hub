import {ChevronRight, MoreVertTwoTone} from "@mui/icons-material";
import {Breadcrumbs, Button, type ButtonProps, Divider, Stack, type SxProps, type Theme, Typography} from "@mui/material"
import type {ReactNode} from "react";
import {useWindowSize} from "../../hooks/use-window-size.ts";
import {PopoverButton} from "../PopoverButton.tsx";

export interface BreadcrumbProps {
    label: string;
    icon?: ReactNode;
    href?: string;
}

export interface PageHeaderProps {
    title?: ReactNode
    subTitle?: ReactNode
    buttons?: ButtonProps[]
    breadcrumbs?: BreadcrumbProps[],
    sx?:SxProps<Theme>
}

const CRUMB_SX = {py: 0.2, px: 0.5}

export function PageHeader({buttons, subTitle, title, breadcrumbs, sx}: PageHeaderProps) {

    const Title = typeof title === "string" ? <Typography variant={"h4"}>{title}</Typography> : title
    const SubTitle = typeof subTitle === "string" ? <Typography variant={"body1"}>{subTitle}</Typography> : subTitle
    const {width} = useWindowSize()
    const MIN_WIDTH_FOR_BUTTONS = 760
    const requiresPopoverButton = ((width < MIN_WIDTH_FOR_BUTTONS && (buttons?.length ?? 0) > 3) || width < 450) && buttons?.length

    return <Stack sx={{gap: 2, ...(sx ?? {})}}>
        {(breadcrumbs && breadcrumbs.length) &&
            <Stack direction={"row"}>
                <Breadcrumbs component={"span"} separator={<ChevronRight/>} sx={{gap: 0}}>
                    {breadcrumbs.map((b, index) => {
                        const key = `breadcrumb-${index}-${b.label}`
                        if (!b.href) {
                            return <Button key={key} component={"span"} aria-current={"page"} variant={"text"}
                                           startIcon={b.icon}
                                           sx={{...CRUMB_SX, color: "text.primary", pointerEvents: "none"}}>
                                {b.label}
                            </Button>
                        }
                        return <Button key={key} href={b.href} variant={"text"} startIcon={b.icon} sx={CRUMB_SX}>
                            {b.label}
                        </Button>
                    })}
                </Breadcrumbs>
            </Stack>
        }
        <Stack direction={"row"} sx={{gap: 2, justifyContent: "space-between", alignItems: "center"}}>
            {Title}
            {requiresPopoverButton &&
                <PopoverButton id={"header-popover-buttons"}
                               buttonLabel={<MoreVertTwoTone sx={{fontSize: "2rem", cursor: "pointer"}}/>}
                               button={{
                                   type:"button",
                                   variant: "text",
                                   sx: {
                                       width: "fit-content"
                                   }
                               }}
                               popover={{
                                   anchorOrigin: {
                                       horizontal: "left",
                                       vertical: "bottom"
                                   },
                                   transformOrigin: {
                                       horizontal: "center",
                                       vertical: "top"
                                   },
                                   children: <Stack sx={{zIndex: "10"}} divider={<Divider/>}>
                                       {buttons?.map((b, index) =>
                                           <Button fullWidth={true}
                                                   {...b}
                                                   sx={{
                                                       borderRadius:0,
                                                       justifyContent: "space-between"
                                                   }}
                                                   key={`page-header-btn-${index}`}/>
                                       )}
                                   </Stack>
                               }}
                />
            }
            {!requiresPopoverButton &&
                <Stack direction={"row"} sx={{gap: 2}}>
                    {buttons?.map((b, index) => <Button sx={{height:"fit-content"}} {...b} key={`page-header-btn-${index}`}/>)}
                </Stack>
            }
        </Stack>
        {SubTitle}
    </Stack>

}