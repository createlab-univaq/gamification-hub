import {createContext, type PropsWithChildren, useContext, useMemo, useState} from "react";
import {lightTheme} from "./light-theme";
import {darkTheme} from "./dark-theme";
import {CssBaseline, ThemeProvider} from "@mui/material";

type ThemeType = "light" | "dark"

interface ThemeProviderProps {
    mode: ThemeType
    switchTheme: (type: ThemeType) => void
}

const defaultTheme = {
    mode: "dark",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    switchTheme: (_type) => {
    }
} satisfies ThemeProviderProps

const ThemeProviderContext = createContext<ThemeProviderProps>(defaultTheme)

const useThemeProvider = () => useContext(ThemeProviderContext)

function GameEngineUIThemeProvider({children}: PropsWithChildren) {

    const THEME_KEY = "game-engine.ui.theme"

    const [mode, setMode] = useState<ThemeType>(() => {
        const currentTheme = localStorage.getItem(THEME_KEY) as ThemeType ?? "dark"
        localStorage.setItem(THEME_KEY, currentTheme)
        return currentTheme
    })

    const theme = useMemo(() => {
        switch (mode) {
            case "dark":
                return darkTheme
            default:
                return lightTheme
        }
    }, [mode])

    const setTheme = (type: ThemeType) => {
        setMode(type)
        localStorage.setItem("game-engine.ui.theme", type)
    }

    return <ThemeProviderContext.Provider value={{mode: mode, switchTheme: setTheme}}>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div data-mui-color-scheme={mode}>
                {children}
            </div>
        </ThemeProvider>
    </ThemeProviderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export {useThemeProvider, GameEngineUIThemeProvider}