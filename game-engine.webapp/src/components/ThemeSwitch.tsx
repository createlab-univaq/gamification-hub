import {useThemeProvider} from "../theme/ThemeProvider.tsx";
import type {SxProps} from "@mui/material";
import {Stack, Switch} from "@mui/material";
import {DarkMode, LightMode} from "@mui/icons-material"

export function ThemeSwitch() {

    const {switchTheme, mode} = useThemeProvider()

    const handleSwitch = (checked: boolean) => {
        switchTheme(checked ? "light" : "dark")
    }

    const iconSx = {
        cursor: "pointer"
    } satisfies SxProps

    return <Stack direction={"row"} sx={{alignItems: "center"}}>
        {mode === "light" ? <LightMode color={"warning"} sx={iconSx} onClick={() => handleSwitch(false)}/> :
            <DarkMode sx={iconSx} onClick={() => handleSwitch(true)}/>}
        <Switch value={mode === "light"} checked={mode === "light"} onChange={(_, checked) => {
            handleSwitch(checked)
        }}/>
    </Stack>

}