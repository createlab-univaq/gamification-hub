import {useCallback, useEffect, useState} from "react";
import type {Edge, Node} from "@xyflow/react";
import {Background, Controls, ReactFlow, useEdgesState, useNodesState,} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {FiredRuleDto, PlayerStateDto, SimulationResultDto} from "../../api/types";
import {Box, Stack, Typography} from "@mui/material";
import {SimulationNode} from "./SimulationNode.tsx";
import {computeFlowLayout, type SimulationNodeType} from "../../utils/react-flow-utils.ts";
import {SimulationNodeDetail} from "./SimulationNodeDetail.tsx";
import {SimulationStateNode} from "./SimulationStateNode.tsx";
import {SimulationStateNodeDetail} from "./SimulationStateNodeDetail.tsx";
import {useTranslation} from "react-i18next";


// ── Custom node ───────────────────────────────────────────────────────────────


const nodeTypes = {ruleNode: SimulationNode, stateNode: SimulationStateNode};

// ── Main component ────────────────────────────────────────────────────────────

interface SimulationFlowGraphProps {
    simulationResult: SimulationResultDto
}

export function SimulationFlowGraph({simulationResult}: SimulationFlowGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedRule, setSelectedRule] = useState<FiredRuleDto>();
    const [selectedStateNode, setSelectedStateNode] = useState<PlayerStateDto & { type: "start" | "end" }>()
    const [t] = useTranslation()
    const isSelected = selectedRule || selectedStateNode;

    useEffect(() => {
        let cancelled = false;
        computeFlowLayout(simulationResult.firedRules ?? [], simulationResult.initialState ?? {}, simulationResult.finalState ?? {})
            .then(({nodes, edges}) => {
                if (!cancelled) {
                    setNodes(nodes);
                    setEdges(edges);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [simulationResult, setNodes, setEdges]);

    const onNodeClick = useCallback((_: unknown, node: SimulationNodeType) => {
        if (node.id === "__start__" || node.id == "__end__") {
            setSelectedRule(undefined);
            const type = node.id.replaceAll("_", "") as "start" | "end" 
            if(selectedStateNode && selectedStateNode.type === type) {
                setSelectedStateNode(undefined)
                return;
            }
            setSelectedStateNode({
                ...(node.data.state ?? {}),
                type: node.id.replaceAll("_", "") as "start" | "end"
            })
            return;
        }
        setSelectedStateNode(undefined)
        const firedRule = (node.data as { rule: FiredRuleDto }).rule ?? undefined
        if(selectedRule && selectedRule.ruleName === firedRule.ruleName) {
            setSelectedRule(undefined)
            return;
        }
        setSelectedRule((node.data as { rule: FiredRuleDto }).rule ?? null);
    }, [selectedRule, selectedStateNode]);

    const onPaneClick = useCallback(() => setSelectedRule(undefined), []);

    return (
        <Stack
            sx={{
                gap: 2,
                width:"100%",
                height:"100%",
            }}
            direction={{
                lg: "row",
                md: "row",
                sm: "column",
                xs: "column"
            }}
        >
            <Box sx={{
                height: "100%",
                minHeight: "60dvh",
                width:"100%",
                display: "flex",
                flexDirection: "column",
                p:2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden"
            }}>
                <Stack sx={{gap:2}}>
                    <Typography variant="h6">
                        {t("scenarios.form.outputs.count", {count: simulationResult.firedRules?.length ?? 0})}
                    </Typography>
                </Stack>
                {nodes.length > 0 && (
                    <ReactFlow
                        style={{flex: 1, minHeight: 0}}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        elevateNodesOnSelect={true}
                        fitView={true}
                    >
                        <Background/>
                        <Controls/>
                    </ReactFlow>
                )}
                <Typography variant="caption" color="text.secondary">
                    {t("scenarios.form.graph.details")}
                </Typography>
            </Box>

            {isSelected &&
                <Stack sx={{width:"100%"}}>
                    {selectedRule &&
                        <SimulationNodeDetail rule={selectedRule}/>
                    }
                    {selectedStateNode &&
                        <SimulationStateNodeDetail type={selectedStateNode.type} playerState={selectedStateNode}/>
                    }
                </Stack>
            }
        </Stack>
    );
}
