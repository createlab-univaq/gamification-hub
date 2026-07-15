import {alpha, createTheme} from '@mui/material/styles'
import {commonComponents, commonShape, commonTypography} from "./common";

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            light: '#C084FC',
            main: '#9333EA',
            dark: '#7E22CE',
            contrastText: '#FFFFFF',
        },
        secondary: {
            light: '#FBCFE8',
            main: '#DB2777',
            dark: '#9D174D',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#F9F7FC',
            paper: '#FFFFFF'
        },
        text: {
            primary: '#1A1625',
            secondary: '#6E6878',
        },
        divider: '#E7E1F0',
        warning: {
            light: '#ffca24',
            main: '#ffd200',
            dark: '#d7a000',
            contrastText: '#674600',
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
        ...commonComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#1A1625',
                    boxShadow: '0 1px 0 0 #E7E1F0',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#FFFFFF',
                    color: '#1A1625',
                    boxShadow: '0 1px 0 0 #E7E1F0',
                },
            },
        },
        MuiButton: {
            defaultProps:{
                size:"large"
            },
            styleOverrides: {
                root: {borderRadius: 6, padding: '6px 16px'},
            },
            variants: [
                {
                    props: {variant: 'contained', color: 'primary'},
                    style: {boxShadow: 'none', '&:hover': {boxShadow: 'none'}},
                },
            ],
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08)',
                    border: '1px solid #E7E1F0',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: ({theme}) => ({
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiTableCell-root': {
                        fontWeight: "bold",
                        color: theme.palette.text.primary,
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
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        '&:hover': {backgroundColor: 'rgba(255,255,255,0.2)'},
                    },
                    '&:hover': {backgroundColor: 'rgba(255,255,255,0.1)'},
                },
            },
        },
    },
})