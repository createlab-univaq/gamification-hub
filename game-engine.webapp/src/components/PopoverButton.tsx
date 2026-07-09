import {type ReactNode, useState} from "react";
import type {ButtonProps, PopoverProps} from "@mui/material"
import {Button, Popover} from "@mui/material";

interface PopoverButtonProps {
    id: string
    buttonLabel: ReactNode
    button: ButtonProps
    popover: Omit<PopoverProps, "open">
}

export function PopoverButton({button, popover, id, buttonLabel,}: PopoverButtonProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const buttonId = open ? id : undefined;

    return <>
        <Button {...button} aria-describedby={buttonId}
                onClick={(event) => {
                    event.stopPropagation()
                    if (button.onClick) {
                        button.onClick(event)
                    }
                    handleClick(event)
                }}
        >
            {buttonLabel}
        </Button>
        <Popover
            onClick={(event) => event.stopPropagation()}
            {...popover}
            id={buttonId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
        >
            {popover.children}
        </Popover>
    </>

}