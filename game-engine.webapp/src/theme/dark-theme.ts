import {alpha, createTheme} from "@mui/material/styles";
import {commonComponents, commonShape, commonTypography} from "./common";

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#D8B4FE',
            main: '#A855F7',
            dark: '#7E22CE',
            contrastText: '#FFFFFF',
        },
        secondary: {
            light: '#831843',
            main: '#9D174D',
            dark: '#500724',
            contrastText: '#F9A8D4',
        },
        background: {
            default: '#0F0B1A',
            paper: '#1E1730'
        },
        text: {
            primary: '#F3EFFA',
            secondary: '#A99BC7',
        },
        divider: '#332B4D',
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
        ...commonComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1E1730',
                    color: '#F3EFFA',
                    boxShadow: '0 1px 0 0 #332B4D',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1E1730',
                    color: '#F3EFFA',
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
                    boxShadow: 'none',
                    border: '1px solid #332B4D',
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