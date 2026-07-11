import type {SxProps} from "@mui/material";
import {ImageComponent} from "../Image.tsx";
import {useThemeProvider} from "../../theme/ThemeProvider.tsx";

interface UnivaqLogoProps {
    sx?: SxProps
}

export function UnivaqLogo(props:UnivaqLogoProps) {

    const {mode} = useThemeProvider()

    const src = `/univaq-logo-${mode}.png`

    return <ImageComponent {...props} src={src} alt={"UnivaqLogo"}/>
}