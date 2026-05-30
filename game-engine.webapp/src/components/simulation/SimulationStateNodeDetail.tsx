import {Card, CardContent, Stack, Typography} from "@mui/material";
import type {PlayerStateDto} from "../../api/types";

interface SimulationStateNodeDetailProps {
    type: "start" | "end"
    playerState: PlayerStateDto
}

export function SimulationStateNodeDetail({playerState, type}: SimulationStateNodeDetailProps) {

    const nodeType = type === "start" ? "Stato iniziale" : "Stato finale"

    return <Card variant="outlined">
            <CardContent sx={{display: "flex", flexDirection: "column", gap: 1}}>
                <Typography sx={{fontWeight: "bold"}}>{nodeType}</Typography>
                {playerState.pointConcepts.length &&
                    <>
                        <Typography sx={{fontWeight: "bold"}}>Point Concepts</Typography>
                        <Stack sx={{px: 2}}>
                            {playerState.pointConcepts.map(pc => {
                                return <Typography>{pc.name}: {pc.score}</Typography>
                            })}
                        </Stack>
                    </>
                }
                {!!playerState.challenges.length &&
                    <>
                        <Typography sx={{fontWeight: "bold"}}>Challenge Points</Typography>
                        <Stack sx={{px: 2}}>
                            {playerState.challenges.map(c => {
                                return <Typography>{c.name}: {c.state}</Typography>
                            })}
                        </Stack>
                    </>
                }
                {!!playerState.badgeCollections.length &&
                    <>
                        <Typography sx={{fontWeight: "bold"}}>Badges</Typography>
                        <Stack sx={{px: 2}}>
                            {playerState.badgeCollections.map(bc => {
                                return <Typography>{bc.name}: {JSON.stringify(bc.badges)}</Typography>
                            })}
                        </Stack>
                    </>
                }
            </CardContent>
        </Card>

}