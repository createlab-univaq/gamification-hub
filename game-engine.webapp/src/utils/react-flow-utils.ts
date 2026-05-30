import type {FiredRuleDto, PlayerStateDto} from "../api/types";
import type {Edge, Node} from "@xyflow/react";
import {MarkerType} from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

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
                style: {
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    width: "10rem",
                },
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

    const layout = await elk.layout({
        id: "root",
        layoutOptions: ELK_OPTIONS,
        children: nodes.map(n => ({id: n.id, width: NODE_WIDTH, height: NODE_HEIGHT})),
        edges: edges.map(e => ({id: e.id, sources: [e.source], targets: [e.target]})),
    });

    const positions = new Map<string, { x: number; y: number }>();
    layout.children?.forEach(c => positions.set(c.id, {x: c.x ?? 0, y: c.y ?? 0}));
    nodes.forEach(n => {
        n.position = positions.get(n.id) ?? {x: 0, y: 0};
    });

    return {nodes, edges};
}
