import type {FiredRuleDto} from "../../api/types";
import {Box, Card, CardContent, Chip, Divider, Stack, Typography} from "@mui/material";

export function SimulationNodeDetail({rule}: { rule: FiredRuleDto }) {
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