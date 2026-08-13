import type {Theme} from '@mui/material/styles'
import {RouterLink} from "../components/RouterLink"

export const commonComponents = {
    MuiButtonBase: {
        defaultProps: {
            LinkComponent: RouterLink,
        },
    },
    MuiCssBaseline: {
        styleOverrides: (theme: Theme) => ({
            '*::-webkit-scrollbar': {
                width: '10px',
                height: '10px',
            },
            '*::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '*::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.divider,
                borderRadius: '8px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
                backgroundColor: theme.palette.text.secondary,
            },
            '*': {
                scrollbarWidth: 'thin',
                scrollbarColor: `${theme.palette.divider} transparent`,
            },
        }),
    },
}

export const commonTypography = {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none' as const, fontWeight: 500 },
}
export const commonShape = { borderRadius: 8 }