import {useCallback, useMemo, useState} from "react";
import type {Node} from "@xyflow/react";
import {Background, Controls, ReactFlow, SelectionMode, useEdgesState, useNodesState,} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {FiredRuleDto, SimulationResultDto} from "../../api/types";
import {Box, Stack, Typography} from "@mui/material";
import {SimulationNode} from "./SimulationNode.tsx";
import {computeFlowLayout} from "../../utils/react-flow-utils.ts";
import {SimulationNodeDetail} from "./SimulationNodeDetail.tsx";
import {SimulationStateNode} from "./SimulationStateNode.tsx";


// ── Custom node ───────────────────────────────────────────────────────────────


const nodeTypes = {ruleNode: SimulationNode, stateNode: SimulationStateNode};

// ── Main component ────────────────────────────────────────────────────────────

interface SimulationFlowGraphProps {
    simulationResult: SimulationResultDto
}

export function SimulationFlowGraph({simulationResult}: SimulationFlowGraphProps) {
    const {nodes: initialNodes, edges: initialEdges} = useMemo(
        () => computeFlowLayout(simulationResult.firedRules, simulationResult.initialState, simulationResult.finalState),
        [simulationResult]
    );

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    const [selectedRule, setSelectedRule] = useState<FiredRuleDto | null>(null);

    const onNodeClick = useCallback((_: unknown, node: Node) => {
        if (node.id === "__start__" || node.id == "__end__") {
            setSelectedRule(null);
            return;
        }
        setSelectedRule((node.data as { rule: FiredRuleDto }).rule ?? null);
    }, []);

    const onPaneClick = useCallback(() => setSelectedRule(null), []);

    return (
        <Stack sx={{gap: 2}}>
            <Box sx={{height: "50dvh", border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden"}}>
                <ReactFlow
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
            </Box>

            {selectedRule
                ? <SimulationNodeDetail rule={selectedRule}/>
                : <Typography variant="caption" color="text.secondary" sx={{textAlign: "center"}}>
                    Click a node to see its details
                </Typography>
            }
        </Stack>
    );
}
