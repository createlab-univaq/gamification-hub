import type {NodeProps} from "@xyflow/react";
import {Handle} from "@xyflow/react";
import {Paper, Typography} from "@mui/material";

export function SimulationStateNode({id}: NodeProps) {

    const isStart = id === "__start__"
    const label = isStart ? "Initial State" : "Final State"

    return <>
        {!isStart && <Handle type={"target"} position={"top"}/>}
        <Paper
            sx={{
                p: 1.5, cursor: "pointer",
                borderColor: "divider",
                backgroundColor: "primary.main",
                transition: "border-color 0.15s",
            }}
        >
            <Typography>{label}</Typography>
        </Paper>
        {isStart && <Handle type={"source"} position={"bottom"}/>}
    </>
}