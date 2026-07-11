import type {SxProps} from "@mui/material";
import {ImageComponent} from "../Image.tsx";
import {useThemeProvider} from "../../theme/ThemeProvider.tsx";

interface AppIconProps {
    sx?:SxProps
}

export function AppIcon(props: AppIconProps) {

    const {mode} = useThemeProvider()

    const src = `/logo-${mode}.png`

    return <ImageComponent {...props} src={src} alt="App Icon" />
}