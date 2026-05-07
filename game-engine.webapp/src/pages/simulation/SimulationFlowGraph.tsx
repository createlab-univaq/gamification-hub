import {useCallback, useMemo, useState} from "react";
import {
    Background,
    Controls,
    Handle,
    MarkerType,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import type {Edge, Node, NodeProps} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {FiredRuleDto} from "../../api/types";
import {Box, Card, CardContent, Chip, Divider, Paper, Stack, Typography} from "@mui/material";

const NODE_WIDTH = 210;
const LEVEL_HEIGHT = 150;
const HORIZONTAL_SPACING = 250;

// ── Layout ───────────────────────────────────────────────────────────────────

function computeLayout(rules: FiredRuleDto[]): { nodes: Node[]; edges: Edge[] } {
    // Each firing gets a unique id: "rule-{index}"
    // Resolve cause → find the most recent prior firing of that rule name
    const sourceIdOf = (i: number): string => {
        const cause = rules[i].cause;
        if (!cause) return "__start__";
        for (let j = i - 1; j >= 0; j--) {
            if (rules[j].ruleName === cause) return `rule-${j}`;
        }
        return "__start__";
    };

    // Assign depth level
    const levels = new Map<string, number>();
    levels.set("__start__", 0);
    rules.forEach((_, i) => {
        const src = sourceIdOf(i);
        levels.set(`rule-${i}`, (levels.get(src) ?? 0) + 1);
    });

    // Group by level
    const byLevel = new Map<number, string[]>();
    for (const [id, level] of levels.entries()) {
        if (!byLevel.has(level)) byLevel.set(level, []);
        byLevel.get(level)!.push(id);
    }

    // Compute x/y positions
    const positions = new Map<string, { x: number; y: number }>();
    for (const [level, ids] of byLevel.entries()) {
        const totalWidth = (ids.length - 1) * HORIZONTAL_SPACING;
        ids.forEach((id, i) => {
            positions.set(id, {
                x: i * HORIZONTAL_SPACING - totalWidth / 2,
                y: level * LEVEL_HEIGHT,
            });
        });
    }

    // Count how many times each rule name fires (to label repeated firings)
    const fireCount = new Map<string, number>();
    rules.forEach(r => fireCount.set(r.ruleName!, (fireCount.get(r.ruleName!) ?? 0) + 1));
    const fireSeq = new Map<string, number>(); // current sequence per name

    const nodes: Node[] = [
        {
            id: "__start__",
            type: "input",
            position: positions.get("__start__") ?? {x: 0, y: 0},
            data: {label: "Start"},
            style: {
                background: "#1976d2", color: "#fff", borderRadius: 8,
                border: "none", fontWeight: 600, padding: "8px 20px",
            },
        },
        ...rules.map((rule, i) => {
            const seq = (fireSeq.get(rule.ruleName!) ?? 0) + 1;
            fireSeq.set(rule.ruleName!, seq);
            const repeated = (fireCount.get(rule.ruleName!) ?? 1) > 1;
            return {
                id: `rule-${i}`,
                type: "ruleNode",
                position: positions.get(`rule-${i}`) ?? {x: 0, y: 0},
                data: {rule, fireSeq: repeated ? seq : null},
                style: {padding: 0, border: "none", background: "transparent", width: NODE_WIDTH},
            };
        }),
    ];

    const edges: Edge[] = rules.map((_, i) => ({
        id: `e-${i}`,
        source: sourceIdOf(i),
        target: `rule-${i}`,
        markerEnd: {type: MarkerType.ArrowClosed},
        style: {strokeWidth: 1.5},
    }));

    return {nodes, edges};
}

// ── Custom node ───────────────────────────────────────────────────────────────

function RuleNode({data, selected}: NodeProps) {
    const rule = data.rule as FiredRuleDto;
    const fireSeq = data.fireSeq as number | null;

    return (
        <>
            <Handle type="target" position={Position.Top} style={{background: "#555"}}/>
            <Paper variant="outlined" sx={{
                p: 1.5, width: NODE_WIDTH, cursor: "pointer",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "primary.50" : "background.paper",
                transition: "border-color 0.15s",
            }}>
                <Stack direction="row" sx={{alignItems: "flex-start", justifyContent: "space-between", gap: 0.5, mb: 0.5}}>
                    <Typography variant="body2" sx={{fontWeight: 600, wordBreak: "break-word", flex: 1}}>
                        {rule.ruleName}
                    </Typography>
                    {fireSeq !== null && (
                        <Chip label={`#${fireSeq}`} size="small" variant="outlined" sx={{flexShrink: 0}}/>
                    )}
                </Stack>
                <Stack direction="row" sx={{gap: 0.5, flexWrap: "wrap"}}>
                    {!!rule.changes?.length && (
                        <Chip label={`${rule.changes.length} change${rule.changes.length > 1 ? "s" : ""}`}
                              size="small" color="success" variant="outlined"/>
                    )}
                    {rule.cause && (
                        <Chip label="chained" size="small" color="warning" variant="outlined"/>
                    )}
                </Stack>
            </Paper>
            <Handle type="source" position={Position.Bottom} style={{background: "#555"}}/>
        </>
    );
}

const nodeTypes = {ruleNode: RuleNode};

// ── Detail panel ──────────────────────────────────────────────────────────────

function RuleDetail({rule}: { rule: FiredRuleDto }) {
    return (
        <Card variant="outlined">
            <CardContent sx={{display: "flex", flexDirection: "column", gap: 1}}>
                <Typography sx={{fontWeight: 600}}>{rule.ruleName}</Typography>

                {rule.cause && (
                    <Typography variant="body2" color="text.secondary">
                        Caused by: {rule.cause}
                    </Typography>
                )}

                {!!rule.reads?.length && (
                    <Stack direction="row" sx={{gap: 0.5, flexWrap: "wrap", alignItems: "center"}}>
                        <Typography variant="caption" color="text.secondary">reads:</Typography>
                        {rule.reads.map(r => (
                            <Chip key={r} label={r} size="small" color="info" variant="outlined"/>
                        ))}
                    </Stack>
                )}

                {!!rule.writes?.length && (
                    <Stack direction="row" sx={{gap: 0.5, flexWrap: "wrap", alignItems: "center"}}>
                        <Typography variant="caption" color="text.secondary">writes:</Typography>
                        {rule.writes.map(w => (
                            <Chip key={w} label={w} size="small" color="warning" variant="outlined"/>
                        ))}
                    </Stack>
                )}

                {!!rule.changes?.length && <>
                    <Divider/>
                    <Typography variant="caption" color="text.secondary">Changes</Typography>
                    {rule.changes.map((c, j) => (
                        <Stack key={j} direction="row" sx={{gap: 1, alignItems: "center", flexWrap: "wrap"}}>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                {c.conceptType} / {c.conceptName} / {c.field}
                            </Typography>
                            <Stack direction="row" sx={{gap: 0.5, alignItems: "center"}}>
                                <Box sx={{
                                    px: 1, py: 0.25, borderRadius: 1,
                                    bgcolor: "error.light", color: "error.contrastText",
                                    fontFamily: "monospace", fontSize: "0.75rem",
                                }}>
                                    {JSON.stringify(c.before)}
                                </Box>
                                <Typography variant="body2">→</Typography>
                                <Box sx={{
                                    px: 1, py: 0.25, borderRadius: 1,
                                    bgcolor: "success.light", color: "success.contrastText",
                                    fontFamily: "monospace", fontSize: "0.75rem",
                                }}>
                                    {JSON.stringify(c.after)}
                                </Box>
                            </Stack>
                        </Stack>
                    ))}
                </>}
            </CardContent>
        </Card>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SimulationFlowGraph({firedRules}: { firedRules: FiredRuleDto[] }) {
    const {nodes: initialNodes, edges: initialEdges} = useMemo(
        () => computeLayout(firedRules),
        [firedRules]
    );

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    const [selectedRule, setSelectedRule] = useState<FiredRuleDto | null>(null);

    const onNodeClick = useCallback((_: unknown, node: Node) => {
        if (node.id === "__start__") {
            setSelectedRule(null);
            return;
        }
        setSelectedRule((node.data as { rule: FiredRuleDto }).rule ?? null);
    }, []);

    const onPaneClick = useCallback(() => setSelectedRule(null), []);

    return (
        <Stack sx={{gap: 2}}>
            <Box sx={{height: 400, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden"}}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    fitView
                    fitViewOptions={{padding: 0.3}}
                >
                    <Background/>
                    <Controls/>
                </ReactFlow>
            </Box>

            {selectedRule
                ? <RuleDetail rule={selectedRule}/>
                : <Typography variant="caption" color="text.secondary" sx={{textAlign: "center"}}>
                    Click a node to see its details
                </Typography>
            }
        </Stack>
    );
}
