import {type SxProps} from "@mui/material";
import {ImageComponent} from "../Image.tsx"
import {useThemeProvider} from "../../theme/ThemeProvider.tsx";

export interface AppLogoProps {
    sx?: SxProps
}


export function AppLogo({sx}: AppLogoProps) {

    const {mode} = useThemeProvider()

    const src = `/app-logo-${mode}.png`

    return <ImageComponent sx={sx} src={src} alt={"AppLogo"}/>
}