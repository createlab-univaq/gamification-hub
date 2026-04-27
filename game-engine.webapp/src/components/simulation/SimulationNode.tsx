import type {FiredRuleDto} from "../../api/types";
import type {NodeProps} from "@xyflow/react";
import {Handle, Position} from "@xyflow/react";
import {Chip, Divider, Stack, Typography} from "@mui/material";


export function SimulationNode({data, selected, width}: NodeProps) {

    const rule = data.rule as FiredRuleDto;
    const fireSeq = data.fireSeq as number | null;

    return <>
        <Handle type="target" position={Position.Top} style={{background: "#555"}}/>
        <Stack
            sx={{
                width: width,
                cursor: "pointer",
                borderRadius: "0.5rem",
                borderWidth:"2px",
                borderStyle:"solid",
                borderColor:  selected ? "primary.main" : "divider",
                backgroundColor: "background.paper",
                transition: "border-color ease-in-out 0.15s",
            }}
            divider={<Divider orientation={"horizontal"}/>}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 0.5,
                    p: 1
                }}
            >
                <Typography variant="body2" sx={{fontWeight: 600, wordBreak: "break-word", flex: 1}}>
                    {rule.ruleName}
                </Typography>
                {fireSeq !== null && (
                    <Chip label={`#${fireSeq}`} size="small" variant="outlined" sx={{flexShrink: 0}}/>
                )}
            </Stack>
            <Stack
                direction="row"
                sx={{
                    gap: 0.5,
                    p:1,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {!!rule.changes?.length && (
                    <Chip
                        label={`${rule.changes.length} change${rule.changes.length > 1 ? "s" : ""}`}
                        variant="outlined"
                        sx={{
                            color: "success.dark"
                        }}
                    />
                )}
            </Stack>
        </Stack>
        <Handle type="source" position={Position.Bottom} style={{background: "#555"}}/>
    </>
}