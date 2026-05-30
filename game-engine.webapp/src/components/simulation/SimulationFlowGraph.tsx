import {useCallback, useEffect, useState} from "react";
import type {Edge, Node} from "@xyflow/react";
import {Background, Controls, ReactFlow, useEdgesState, useNodesState,} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {FiredRuleDto, PlayerStateDto, SimulationResultDto} from "../../api/types";
import {Box, Stack, Typography} from "@mui/material";
import {SimulationNode} from "./SimulationNode.tsx";
import {computeFlowLayout} from "../../utils/react-flow-utils.ts";
import {SimulationNodeDetail} from "./SimulationNodeDetail.tsx";
import {SimulationStateNode} from "./SimulationStateNode.tsx";
import {SimulationStateNodeDetail} from "./SimulationStateNodeDetail.tsx";


// ── Custom node ───────────────────────────────────────────────────────────────


const nodeTypes = {ruleNode: SimulationNode, stateNode: SimulationStateNode};

// ── Main component ────────────────────────────────────────────────────────────

interface SimulationFlowGraphProps {
    simulationResult: SimulationResultDto
}

export function SimulationFlowGraph({simulationResult}: SimulationFlowGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedRule, setSelectedRule] = useState<FiredRuleDto | null>(null);
    const [selectedStateNode, setSelectedStateNode] = useState<PlayerStateDto & { type: "end" | "start" }>()

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

    const onNodeClick = useCallback((_: unknown, node: Node) => {
        if (node.id === "__start__" || node.id == "__end__") {
            setSelectedRule(null);
            setSelectedStateNode({
                ...node.data.state,
                type: node.id.replaceAll("_", "")
            })
            return;
        }
        setSelectedStateNode(undefined)
        setSelectedRule((node.data as { rule: FiredRuleDto }).rule ?? null);
    }, []);

    const onPaneClick = useCallback(() => setSelectedRule(null), []);

    return (
        <Stack sx={{gap: 2}}>
            <Box sx={{
                height: "50dvh",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden"
            }}>
                {nodes.length > 0 && (
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
                )}
            </Box>

            {selectedRule
                ? <SimulationNodeDetail rule={selectedRule}/>
                : <Typography variant="caption" color="text.secondary" sx={{textAlign: "center"}}>
                    Click a node to see its details
                </Typography>
            }
            {selectedStateNode &&
                <SimulationStateNodeDetail type={selectedStateNode.type} playerState={selectedStateNode}/>
            }
        </Stack>
    );
}
