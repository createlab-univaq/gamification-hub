import {useQuery} from "@tanstack/react-query";
import {gameClient, ruleClient} from "../../api";
import type {RuleImpactDto} from "../../api/types";
import {Dialog, DialogContent, DialogTitle, Typography} from "@mui/material";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {useEffect} from "react";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Loading} from "../Loading.tsx";
import {ImpactAnalysisGraph} from "./ImpactAnalysisGraph.tsx";

interface ImpactAnalysisModalProps {
    gameId:string
    open:boolean
    setOpen:(o:boolean)=>void
}

export function ImpactAnalysisModal({setOpen, open, gameId}:ImpactAnalysisModalProps) {

    
    
    return <Dialog open={open} onClose={()=>setOpen(false)}>
        <DialogTitle title={"Rule Impact Analysis"} content={"HH"} variant={"h4"}>
            Rule Impact Analysis
        </DialogTitle>
        <DialogContent sx={{minWidth:"40rem"}}>
            {isLoading && <Loading fullScreen={false}/>}
            {(!isLoading && data) &&
                <ImpactAnalysisGraph impactAnalysis={data}/>
            }
        </DialogContent>
    </Dialog>
    
}
