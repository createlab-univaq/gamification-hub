import type {NodeProps} from "@xyflow/react";
import {Handle, Position} from "@xyflow/react";
import {Chip, Divider, Stack, Typography} from "@mui/material";
import type {RuleImpactDto} from "../../api/types";
import {useTranslation} from "react-i18next";

export function ImpactAnalysisNode({data, selected, width}: NodeProps) {

    const rule = data.rule as RuleImpactDto;
    const [t] = useTranslation()

    return <>
        <Handle type="target" position={Position.Top} style={{opacity: 0}} isConnectable={false}/>
        <Stack
            sx={{
                width: width,
                cursor: "pointer",
                borderRadius: "0.5rem",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: selected ? "primary.main" : "divider",
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
            </Stack>
            <Stack
                direction="row"
                sx={{
                    gap: 0.5,
                    p: 1,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                {!!rule.writes?.length && (
                    <Chip label={`${t("rules.writes")} ${rule.writes.length}`} size="small" variant="outlined"/>
                )}
                {!!rule.reads?.length && (
                    <Chip label={`${t("rules.reads")} ${rule.reads.length}`} size="small" variant="outlined"/>
                )}
            </Stack>
        </Stack>
        <Handle type="source" position={Position.Bottom} style={{opacity: 0}} isConnectable={false}/>
    </>
}
