import type {CircularProgressProps, LinearProgressProps} from "@mui/material"
import {CircularProgress, Dialog, DialogContent, LinearProgress} from "@mui/material";

type LoadingPropsType = CircularProgressProps | LinearProgressProps

interface LoadingProps extends LoadingPropsType {
    fullScreen?: boolean
    type?:"linear" | "circular"
}

export function Loading({fullScreen, type, ...props}: LoadingProps) {

    const LoaderComponent = type === "linear" ? LinearProgress : CircularProgress

    if (!fullScreen) {
        return <LoaderComponent thickness={6} {...props}/>
    }

    return <Dialog open={true} sx={{
        "& .MuiPaper-root": {
            width:"100%",
            backgroundColor: "transparent",
            boxShadow: "unset"
        }
    }}>
        <DialogContent sx={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <LoaderComponent size={"4rem"} thickness={4} {...props}/>
        </DialogContent>
    </Dialog>

}