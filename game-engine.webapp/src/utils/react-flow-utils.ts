import type {FiredRuleDto, PlayerStateDto, RuleImpactDto} from "../api/types";
import type {Edge, InternalNode, Node} from "@xyflow/react";
import {MarkerType, Position} from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

const ruleNodeStyle = (width: string) => ({
    padding: 0,
    border: "none",
    background: "transparent",
    width,
});

async function applyElkLayout(
    nodes: Node[],
    edges: Edge[],
    options: Record<string, string>,
    size: { width: number; height: number }
): Promise<void> {
    const layout = await elk.layout({
        id: "root",
        layoutOptions: options,
        children: nodes.map(n => ({id: n.id, width: size.width, height: size.height})),
        edges: edges.filter(e => e.source !== e.target).map(e => ({id: e.id, sources: [e.source], targets: [e.target]})),
    });
    const positions = new Map<string, { x: number; y: number }>();
    layout.children?.forEach(c => positions.set(c.id, {x: c.x ?? 0, y: c.y ?? 0}));
    nodes.forEach(n => {
        n.position = positions.get(n.id) ?? {x: 0, y: 0};
    });
}

const NODE_WIDTH = 160   // 10rem
const NODE_HEIGHT = 88

const ELK_OPTIONS: Record<string, string> = {
    "elk.algorithm": "layered",
    "elk.direction": "DOWN",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.spacing.nodeNodeBetweenLayers": "80",
    "elk.layered.nodePlacement.strategy": "LINEAR_SEGMENTS",
    "elk.spacing.nodeNode": "40",
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
}

export async function computeFlowLayout(
    rules: FiredRuleDto[],
    startState: PlayerStateDto,
    endState: PlayerStateDto
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const sourcesMap = new Map<number, string>(); // rule index -> source node id
    const lastSeen = new Map<string, number>();    // ruleName -> last index

    rules.forEach((rule, i) => {
        let src = "__start__";
        if (rule.cause && lastSeen.has(rule.cause)) {
            src = `rule-${lastSeen.get(rule.cause)!}`;
        }
        sourcesMap.set(i, src);
        if (rule.ruleName) {
            lastSeen.set(rule.ruleName, i);
        }
    });

    const sources = new Set(sourcesMap.values());
    const leafs = rules
        .map((_, i) => `rule-${i}`)
        .filter(id => !sources.has(id));

    const fireCount = new Map<string, number>();
    for (const r of rules) {
        if (r.ruleName) {
            fireCount.set(r.ruleName, (fireCount.get(r.ruleName) ?? 1) + 1);
        }
    }
    const fireSeq = new Map<string, number>();

    const nodes: Node[] = [
        {
            id: "__start__",
            type: "stateNode",
            position: {x: 0, y: 0},
            data: {state: startState, label: "Start"}
        },
        ...rules.map((rule, i) => {
            const seq = (fireSeq.get(rule.ruleName!) ?? 0) + 1;
            fireSeq.set(rule.ruleName!, seq);

            const repeated = (fireCount.get(rule.ruleName!) ?? 1) > 1;

            return {
                id: `rule-${i}`,
                type: "ruleNode",
                position: {x: 0, y: 0},
                data: {rule, fireSeq: repeated ? seq : null},
                style: ruleNodeStyle("10rem"),
            };
        }),
        {
            id: "__end__",
            type: "stateNode",
            position: {x: 0, y: 0},
            data: {state: endState, label: "End"}
        }
    ];

    const edges: Edge[] = rules.map((_, i) => ({
        id: `e-${i}`,
        source: sourcesMap.get(i)!,
        target: `rule-${i}`,
        type: "smoothstep",
        markerEnd: {type: MarkerType.ArrowClosed},
        style: {strokeWidth: 1.5},
    }));

    edges.push(
        ...leafs.map((id, i) => ({
            id: `e-end-${i}`,
            source: id,
            target: "__end__",
            type: "smoothstep",
            markerEnd: {type: MarkerType.ArrowClosed},
            style: {strokeWidth: 1.5},
        }))
    );

    await applyElkLayout(nodes, edges, ELK_OPTIONS, {width: NODE_WIDTH, height: NODE_HEIGHT});

    return {nodes, edges};
}

const IMPACT_NODE_WIDTH = 200   // 12rem-ish
const IMPACT_NODE_HEIGHT = 72

const IMPACT_ELK_OPTIONS: Record<string, string> = {
    "elk.algorithm": "layered",
    "elk.direction": "DOWN",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.cycleBreaking.strategy": "GREEDY",
    "elk.layered.spacing.nodeNodeBetweenLayers": "90",
    "elk.spacing.nodeNode": "50",
}

// Drools impact-analysis convention: solid POSITIVE, dashed NEGATIVE, dotted UNKNOWN
const REACTIVITY_STYLE: Record<string, { stroke: string; dash?: string }> = {
    POSITIVE: {stroke: "#2e7d32"},
    NEGATIVE: {stroke: "#c62828", dash: "8 4"},
    UNKNOWN: {stroke: "#9e9e9e", dash: "2 4"},
}

export const REACTIVITY_TYPES = ["POSITIVE", "NEGATIVE", "UNKNOWN"] as const;

export async function computeImpactLayout(
    impact: RuleImpactDto[],
    activeReactivities: Set<string>
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const nodes: Node[] = impact
        .filter(r => r.ruleName)
        .map(r => ({
            id: r.ruleName!,
            type: "ruleNode",
            position: {x: 0, y: 0},
            data: {rule: r},
            style: ruleNodeStyle("12rem"),
        }));

    const nodeIds = new Set(nodes.map(n => n.id));
    const pairKey = (a: string, b: string) => (a < b ? a + " " + b : b + " " + a);

    // Only links of an active reactivity type are built — everything else is skipped
    // entirely, so both ELK and the renderer only ever see the visible edges.
    const links: { source: string; target: string; reactivity: string }[] = [];
    const pairTotal = new Map<string, number>();
    for (const r of impact) {
        if (!r.ruleName) continue;
        for (const link of r.activates ?? []) {
            if (!link.ruleName || !nodeIds.has(link.ruleName)) continue;
            const reactivity = (link.reactivity ?? "UNKNOWN").toUpperCase();
            if (!activeReactivities.has(reactivity)) continue;
            links.push({source: r.ruleName, target: link.ruleName, reactivity});
            const k = pairKey(r.ruleName, link.ruleName);
            pairTotal.set(k, (pairTotal.get(k) ?? 0) + 1);
        }
    }

    const pairIndex = new Map<string, number>();
    const edges: Edge[] = links.map((l, i) => {
        const k = pairKey(l.source, l.target);
        const idx = pairIndex.get(k) ?? 0;
        pairIndex.set(k, idx + 1);
        const s = REACTIVITY_STYLE[l.reactivity] ?? REACTIVITY_STYLE.UNKNOWN;
        return {
            id: `e-${i}`,
            source: l.source,
            target: l.target,
            type: "floating",
            markerEnd: {type: MarkerType.ArrowClosed, color: s.stroke},
            style: {stroke: s.stroke, strokeWidth: 2, ...(s.dash ? {strokeDasharray: s.dash} : {})},
            data: {
                reactivity: l.reactivity,
                selfLoop: l.source === l.target,
                pairCount: pairTotal.get(k)!,
                pairIndex: idx,
            },
        };
    });

    await applyElkLayout(nodes, edges, IMPACT_ELK_OPTIONS, {width: IMPACT_NODE_WIDTH, height: IMPACT_NODE_HEIGHT});

    return {nodes, edges};
}

// ── Floating-edge geometry (attach point on each node's border, aimed at the other node) ──

function nodeIntersection(node: InternalNode<Node>, other: InternalNode<Node>): { x: number; y: number } {
    const w = (node.measured?.width ?? 0) / 2;
    const h = (node.measured?.height ?? 0) / 2;
    const nx = node.internals.positionAbsolute.x;
    const ny = node.internals.positionAbsolute.y;
    const ox = other.internals.positionAbsolute.x + (other.measured?.width ?? 0) / 2;
    const oy = other.internals.positionAbsolute.y + (other.measured?.height ?? 0) / 2;

    const x2 = nx + w;
    const y2 = ny + h;
    const xx1 = (ox - x2) / (2 * w) - (oy - y2) / (2 * h);
    const yy1 = (ox - x2) / (2 * w) + (oy - y2) / (2 * h);
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
    const xx3 = a * xx1;
    const yy3 = a * yy1;

    return {x: w * (xx3 + yy3) + x2, y: h * (-xx3 + yy3) + y2};
}

function edgeSide(node: InternalNode<Node>, point: { x: number; y: number }): Position {
    const nx = Math.round(node.internals.positionAbsolute.x);
    const ny = Math.round(node.internals.positionAbsolute.y);
    const w = node.measured?.width ?? 0;
    const h = node.measured?.height ?? 0;
    const px = Math.round(point.x);
    const py = Math.round(point.y);

    if (px <= nx + 1) return Position.Left;
    if (px >= nx + w - 1) return Position.Right;
    if (py <= ny + 1) return Position.Top;
    if (py >= ny + h - 1) return Position.Bottom;
    return Position.Top;
}

export function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
    const sourcePoint = nodeIntersection(source, target);
    const targetPoint = nodeIntersection(target, source);
    return {
        sx: sourcePoint.x,
        sy: sourcePoint.y,
        tx: targetPoint.x,
        ty: targetPoint.y,
        sourcePos: edgeSide(source, sourcePoint),
        targetPos: edgeSide(target, targetPoint),
    };
}
