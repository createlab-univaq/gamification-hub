import {Button, type ButtonProps} from "@mui/material";
import type {ReactNode} from "react";
import {useWindowSize} from "../hooks/use-window-size.ts";

interface ButtonIconProps extends ButtonProps {
    icon: ReactNode
}

export function ButtonIcon({icon, children, ...props}: ButtonIconProps) {

    const {isMobile} = useWindowSize()

    return <Button {...props}>
        {!isMobile && children}
        {isMobile && icon}
    </Button>

}