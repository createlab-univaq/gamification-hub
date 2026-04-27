import type {FiredRuleDto, PlayerStateDto} from "../api/types";
import type {Edge, Node} from "@xyflow/react";
import {MarkerType} from "@xyflow/react";

const LEVEL_HEIGHT = 128 // 8rem somewhat

export function computeFlowLayout(rules: FiredRuleDto[], startState, endState): {
    nodes: Node[];
    edges: Edge[],
    startState: PlayerStateDto,
    endState: PlayerStateDto
} {
    const levels = new Map<string, number>();
    const sourcesMap = new Map<number, string>(); // cache sources per index
    const lastSeen = new Map<string, number>();   // ruleName -> last index

    levels.set("__start__", 0);
    let maxLvl = 1
    // Compute sources + levels in ONE pass
    rules.forEach((rule, i) => {
        let src = "__start__";

        if (rule.cause && lastSeen.has(rule.cause)) {
            src = `rule-${lastSeen.get(rule.cause)!}`;
        }

        sourcesMap.set(i, src);
        const lvl = (levels.get(src) ?? 0) + 1
        if (lvl >= maxLvl) {
            maxLvl = lvl
        }
        levels.set(`rule-${i}`, lvl);

        // update last seen
        if (rule.ruleName) {
            lastSeen.set(rule.ruleName, i);
        }
    });

    levels.set("__end__", maxLvl + 1);

    // Build sources set (no recomputation)
    const sources = new Set(sourcesMap.values());

    const leafs = rules
        .map((_, i) => `rule-${i}`)
        .filter(id => !sources.has(id));

    // Group by level
    const byLevel = new Map<number, string[]>();
    for (const [id, level] of levels.entries()) {
        if (!byLevel.has(level)) byLevel.set(level, []);
        byLevel.get(level)!.push(id);
    }

    // Positions
    const positions = new Map<string, { x: number; y: number }>();
    for (const [level, ids] of byLevel.entries()) {
        ids.forEach((id) => {
            positions.set(id, {
                x: 50,
                y: (level + 1) * LEVEL_HEIGHT
            });
        });
    }

    // Fire counts
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
            position: positions.get("__start__") ?? {x: 0, y: 0},
            data: {state: startState, label: "Start"}
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
            position: positions.get("__end__") ?? {x: 0, y: 0},
            data: {state: endState, label: "End"}
        }
    ];

    const edges: Edge[] = rules.map((_, i) => ({
        id: `e-${i}`,
        source: sourcesMap.get(i)!,
        target: `rule-${i}`,
        markerEnd: {type: MarkerType.ArrowClosed},
        style: {strokeWidth: 1.5},
    }));

    edges.push(
        ...leafs.map((id, i) => ({
            id: `e-end-${i}`,
            source: id,
            target: "__end__",
            markerEnd: {type: MarkerType.ArrowClosed},
            style: {strokeWidth: 1.5},
        }))
    );

    return {nodes, edges};
}