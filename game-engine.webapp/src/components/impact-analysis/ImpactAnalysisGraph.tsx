import type {RuleImpactDto} from "../../api/types";
import type {Edge, EdgeProps, Node} from "@xyflow/react";
import {Background, BaseEdge, Controls, ReactFlow, useEdgesState, useInternalNode, useNodesState} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {Box, Button, Card, CardContent, Checkbox, Divider, Stack, Typography} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import {ImpactAnalysisNode} from "./ImpactAnalysisNode.tsx";
import {computeImpactLayout, getEdgeParams, REACTIVITY_TYPES} from "../../utils/react-flow-utils.ts";
import {useTranslation} from "react-i18next";
import {useGame} from "../../hooks/use-game.ts";

interface ImpactAnalysisGraphProps {
    impactAnalysis: RuleImpactDto[]
}

const EDGE_SPREAD = 70;
const SELF_LOOP_R = 28;

const REACTIVITY_META: Record<string, {
    color: string;
    line: "solid" | "dashed" | "dotted";
    label: string;
    desc: string
}> = {
    POSITIVE: {
        color: "#2e7d32",
        line: "solid",
        label: "impact_analysis.links.types.positive.label",
        desc: "impact_analysis.links.types.positive.desc"
    },
    NEGATIVE: {
        color: "#c62828",
        line: "dashed",
        label: "impact_analysis.links.types.negative.label",
        desc: "impact_analysis.links.types.negative.desc"
    },
    UNKNOWN: {
        color: "#9e9e9e",
        line: "dotted",
        label: "impact_analysis.links.types.neutral.label",
        desc: "impact_analysis.links.types.neutral.desc"
    },
};

type FloatingEdgeData = { reactivity?: string; selfLoop?: boolean; pairCount?: number; pairIndex?: number };

function FloatingEdge({id, source, target, markerEnd, style, data}: EdgeProps) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);
    if (!sourceNode || !targetNode) return null;

    const d = (data ?? {}) as FloatingEdgeData;

    // Self-loop: small arc off the node's right side (getEdgeParams degenerates when source equals target)
    if (d.selfLoop) {
        const lx = sourceNode.internals.positionAbsolute.x + (sourceNode.measured?.width ?? 0);
        const ly = sourceNode.internals.positionAbsolute.y + (sourceNode.measured?.height ?? 0) / 2;
        const loop = `M ${lx},${ly - 6} C ${lx + SELF_LOOP_R * 2},${ly - SELF_LOOP_R} ${lx + SELF_LOOP_R * 2},${ly + SELF_LOOP_R} ${lx},${ly + 6}`;
        return <BaseEdge id={id} path={loop} markerEnd={markerEnd} style={style}/>;
    }

    const count = d.pairCount ?? 1;
    const index = d.pairIndex ?? 0;
    const {sx, sy, tx, ty} = getEdgeParams(sourceNode, targetNode);

    // Perpendicular offset so parallel / bidirectional edges fan apart instead of overlapping.
    // `flip` makes the perpendicular direction-independent, so the two directions bow to opposite sides.
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.hypot(dx, dy) || 1;
    const flip = source < target ? 1 : -1;
    const nx = (-dy / len) * flip;
    const ny = (dx / len) * flip;
    const offset = count > 1 ? (index - (count - 1) / 2) * EDGE_SPREAD : 0;

    const cx = (sx + tx) / 2 + nx * offset;
    const cy = (sy + ty) / 2 + ny * offset;
    const path = `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`;

    return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style}/>;
}

const nodeTypes = {ruleNode: ImpactAnalysisNode};
const edgeTypes = {floating: FloatingEdge};

export function ImpactAnalysisGraph({impactAnalysis}: ImpactAnalysisGraphProps) {

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [active, setActive] = useState<Set<string>>(() => new Set(["POSITIVE", "NEGATIVE"]));
    const game = useGame()
    const [selectedNode, setSelectedNode] = useState<RuleImpactDto>()
    const [t] = useTranslation()

    useEffect(() => {
        let cancelled = false;
        computeImpactLayout(impactAnalysis ?? [], active)
            .then(({nodes, edges}) => {
                if (!cancelled) {
                    setNodes(nodes);
                    setEdges(edges);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [impactAnalysis, active, setNodes, setEdges]);

    const onNodeClick = useCallback((_: unknown, node: Node) => {
        setSelectedNode(node.data?.rule ?? undefined)
    }, []);

    const toggle = (t: string) => setActive(prev => {
        const next = new Set(prev);
        if (next.has(t)) next.delete(t); else next.add(t);
        return next;
    });

    if (nodes.length === 0) {
        return <Stack sx={{alignItems: "center", justifyContent: "center", height: "70dvh"}}>
            <Typography>{t("rules.empty_list")}</Typography>
            <Button href={`/games/${game.id}/rules`}>{t("buttons:turn_back")}</Button>
        </Stack>;
    }

    return <Stack direction={{xs: "column", md: "row"}}
                  sx={{height: {md: "60dvh"}, width: "100%", minWidth: 0, gap: 2}}>
        <Box sx={{
            flex: {xs: "0 0 auto", md: 1},
            minWidth: 0,
            height: {xs: "60dvh", md: "100%"},
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden"
        }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                elevateNodesOnSelect={true}
                fitView={true}
            >
                <Background/>
                <Controls/>
            </ReactFlow>
        </Box>
        <Stack sx={{gap: 1}}>
            <Card variant="outlined"
                  sx={{width: {xs: "100%", md: "15rem"}, flexShrink: 0, alignSelf: "flex-start"}}>
                <CardContent>
                    <Typography variant="subtitle2"
                                sx={{fontWeight: 700}}>{t("impact_analysis.links.title")}</Typography>
                    <Divider sx={{my: 1}}/>
                    <Stack sx={{gap: 0.5}}>
                        {REACTIVITY_TYPES.map(type => {
                            const meta = REACTIVITY_META[type];
                            const on = active.has(type);
                            return (
                                <Stack
                                    key={type}
                                    direction="row"
                                    onClick={() => toggle(type)}
                                    sx={{
                                        alignItems: "center",
                                        gap: 1,
                                        p: 0.5,
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        opacity: on ? 1 : 0.5,
                                        "&:hover": {backgroundColor: "action.hover"},
                                    }}
                                >
                                    <Checkbox
                                        checked={on}
                                        size="small"
                                        sx={{p: 0, color: meta.color, "&.Mui-checked": {color: meta.color}}}
                                    />
                                    <Stack sx={{flex: 1, minWidth: 0}}>
                                        <Stack direction="row" sx={{alignItems: "center", gap: 1}}>
                                            <Box sx={{
                                                width: "1.75rem",
                                                flexShrink: 0,
                                                borderTop: `3px ${meta.line} ${meta.color}`
                                            }}/>
                                            <Typography variant="body2"
                                                        sx={{fontWeight: 600}}>{t(meta.label)}</Typography>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">{t(meta.desc)}</Typography>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>
            {!!selectedNode &&
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" sx={{fontWeight: 700}}>{selectedNode.ruleName}</Typography>
                        <Divider sx={{my: 1}}/>
                        <Stack sx={{display: selectedNode?.reads?.length ? "flex" : "none"}}>
                            <Typography sx={{fontWeight: "bold"}}>{t("rules.reads")}:</Typography>
                            {selectedNode.reads?.map((r, index) => {
                                return <Typography
                                    key={`impact-read-${index}`}>{r.conceptType} {r.conceptName} {r.field ?? "name"}</Typography>
                            })}
                        </Stack>
                        <Stack sx={{display: selectedNode.writes?.length ? "flex" : "none"}}>
                            <Typography sx={{fontWeight: "bold"}}>{t("rules.writes")}:</Typography>
                            {selectedNode.writes?.map((r, index) => {
                                return <Typography
                                    key={`impact-write-${index}`}>{r.conceptType} {r.field} {r.conceptName}</Typography>
                            })}
                        </Stack>
                    </CardContent>
                </Card>
            }
        </Stack>
    </Stack>

}
