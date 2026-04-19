import {alpha, createTheme} from "@mui/material/styles";
import {commonShape, commonTypography} from "./common";

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#93B4F8',
            main: '#3B82F6',
            dark: '#1D4ED8',
            contrastText: '#FFFFFF',
        },
        secondary: {
            light: '#1E3A5F',
            main: '#172D4D',
            dark: '#0F1E33',
            contrastText: '#93B4F8',
        },
        background: {
            default: '#0F172A',
            paper: '#1E293B',
            secondary:'#1d2838'
        },
        text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
        },
        divider: '#334155',
        warning: {
            light: '#ffd455',
            main: '#ffcc44',
            dark: '#d09c00',
            contrastText: '#8a8a8a',
        },
        success: {
            light: '#acf88a',
            main: '#78ff33',
            dark: '#41c000',
        }
    },
    typography: commonTypography,
    shape: commonShape,
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1E293B',
                    color: '#F1F5F9',
                    boxShadow: '0 1px 0 0 #334155',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1E293B',
                    color: '#F1F5F9',
                    borderRight: 'none',
                },
            },
        },
        MuiButton: {
            defaultProps:{
              size:"large"
            },
            styleOverrides: {
                root: {borderRadius: 6, padding: '6px 16px'},
                containedPrimary: {
                    boxShadow: 'none',
                    '&:hover': {boxShadow: 'none'},
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    border: '1px solid #334155',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: ({theme}) => ({
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    '& .MuiTableCell-root': {
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    },
                }),
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {borderRadius: 6, fontWeight: 500},
            },
        },
        MuiTextField: {
            defaultProps: {size: 'medium', variant: 'outlined'},
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    margin: '2px 8px',
                    width: 'calc(100% - 16px)',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': {backgroundColor: 'rgba(255,255,255,0.15)'},
                    },
                    '&:hover': {backgroundColor: 'rgba(255,255,255,0.06)'},
                },
            },
        },
    },
})