import {Handle, type NodeProps, Position} from "@xyflow/react";
import {Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

export function SimulationStateNode({id}: NodeProps) {

    const isStart = id === "__start__"
    const [t] = useTranslation();
    const label = isStart ? t("scenarios.form.graph.nodes.start") : t("scenarios.form.graph.nodes.end")

    return <>
        {!isStart && <Handle type={"target"} position={Position.Top}/>}
        <Paper
            sx={{
                p: 1.5, cursor: "pointer",
                borderColor: "divider",
                backgroundColor: "primary.main",
                transition: "border-color 0.15s",
            }}
        >
            <Typography sx={{fontWeight:"bold"}} color={"textPrimary"}>{label}</Typography>
        </Paper>
        {isStart && <Handle type={"source"} position={Position.Bottom}/>}
    </>
}