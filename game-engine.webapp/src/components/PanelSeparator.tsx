import type {SeparatorProps} from "react-resizable-panels";
import {Separator} from "react-resizable-panels";
import {styled, type SxProps} from "@mui/material";

type PanelSeparatorProps = Omit<SeparatorProps, "style"> & { sx?: SxProps }

const StyledSeparator = styled(Separator)(({sx, theme}) => ({
    ...(sx && {}),
    width: '2px',
    color: theme.palette.background.paper,
    backgroundColor: theme.palette.background.paper,
    transition: 'background-color 0.2s',
    outlineColor: "unset",
    cursor: 'col-resize',
    '&:hover': {
        backgroundColor: theme.palette.divider,
        borderColor: theme.palette.divider
    },
    '&[data-separator="active"]': {
        outlineColor: theme.palette.divider
    },
    '&[data-separator="inactive"]': {
        outlineColor: theme.palette.background.paper,
        borderColor: theme.palette.background.paper
    },
    '&[aria-orientation="horizontal"]': {
        width: "100%",
        height: "2px"
    }
}));


export function PanelSeparator(props: PanelSeparatorProps) {
    return <StyledSeparator {...props}/>
}