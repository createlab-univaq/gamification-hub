import {Card, CardContent, Chip, Stack, Typography} from "@mui/material";
import type {PlayerStateDto} from "../../api/types";
import {useTranslation} from "react-i18next";

interface SimulationStateNodeDetailProps {
    type: "start" | "end"
    playerState: PlayerStateDto
}

export function SimulationStateNodeDetail({playerState, type}: SimulationStateNodeDetailProps) {

    const [t] = useTranslation();
    const isStart = type === "start";
    const nodeType = isStart ? t("scenarios.form.graph.nodes.start") : t("scenarios.form.graph.nodes.end")

    const PointChip = ({value}:{value:number}) => {
        return <Chip size={"small"} color={isStart ? "default" : "success"} label={`${value}`} />
    }

    return <Card variant="outlined">
        <CardContent sx={{display: "flex", flexDirection: "column", gap: 1}}>
            <Typography sx={{fontWeight: "bold"}}>{nodeType}</Typography>
            {playerState.pointConcepts?.length &&
                <>
                    <Typography sx={{fontWeight: "bold"}}>{t("sidebar.points")}</Typography>
                    <Stack sx={{px: 2}}>
                        {playerState.pointConcepts.map(pc => {
                            return <Typography>{pc.name}: <PointChip value={pc.score ?? 0}/></Typography>
                        })}
                    </Stack>
                </>
            }
            {!!playerState.challenges?.length &&
                <>
                    <Typography sx={{fontWeight: "bold"}}>{t("sidebar.challenges")}</Typography>
                    <Stack sx={{px: 2}}>
                        {playerState.challenges.map(c => {
                            return <Typography>{c.name}: {c.state}</Typography>
                        })}
                    </Stack>
                </>
            }
            {!!playerState.badgeCollections?.length &&
                <>
                    <Typography sx={{fontWeight: "bold"}}>{t("sidebar.badges")}</Typography>
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