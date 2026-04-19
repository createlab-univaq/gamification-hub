import type {SeparatorProps} from "react-resizable-panels";
import {Separator} from "react-resizable-panels";
import type {SxProps} from "@mui/material";
import {styled} from "@mui/material";

interface PanelSeparatorProps extends Omit<SeparatorProps, "style"> {
    sx?: SxProps
}

export function PanelSeparator({sx,...rest}: PanelSeparatorProps) {

    const StyledSeparator = styled(Separator)(({theme}) => ({
        ...sx,
        width: '2px',
        color: theme.palette.background.secondary,
        backgroundColor: theme.palette.background.secondary,
        transition: 'background-color 0.2s',
        outlineColor:"unset",
        cursor: 'col-resize',
        '&:hover': {
            backgroundColor: theme.palette.divider,
            borderColor: theme.palette.divider
        },
        '&[data-separator="active"]': {
            outlineColor: theme.palette.divider
        },
        '&[data-separator="inactive"]': {
            outlineColor: theme.palette.background.secondary,
            borderColor: theme.palette.background.secondary
        },
        '&[aria-orientation="horizontal"]':{
            width:"100%",
            height:"2px"
        }
    }));

    return <StyledSeparator {...rest}/>
}