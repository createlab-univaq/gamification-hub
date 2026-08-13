import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Dialog,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Close, ExpandMore} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import type {PointConceptDto} from "../api/types";
import {formatDate, formatMilliseconds} from "../utils/date-utils.ts";

interface PeriodInstancesDialogProps {
    concept?: PointConceptDto
    setConcept: (c: PointConceptDto | undefined) => void
}

export function PeriodInstancesDialog({concept, setConcept}: PeriodInstancesDialogProps) {

    const {t} = useTranslation()

    if (!concept) {
        return <></>
    }

    const periods = Object.entries(concept.periods ?? {})
        .filter(([, period]) => (period.instances ?? []).length > 0)

    return <Dialog open={!!concept}
                   onClose={() => setConcept(undefined)}
                   fullWidth={true}
                   maxWidth={"sm"}
                   slotProps={{paper: {sx: {maxHeight: "85vh"}}}}
    >
        <Stack sx={{flexDirection: "row-reverse", width: "100%", padding: 1, flexShrink: 0}}>
            <Close sx={{cursor: "pointer"}} onClick={() => setConcept(undefined)}/>
        </Stack>
        <Stack sx={{paddingX: 4, paddingBottom: 4, gap: 2, minHeight: 0, overflow: "hidden"}}>
            <Stack sx={{gap: 0.5, flexShrink: 0}}>
                <Typography variant={"h5"}>{concept.name}</Typography>
                <Typography variant={"body2"} color={"text.secondary"}>
                    {t("points.periods.total", {score: concept.score ?? 0})}
                </Typography>
            </Stack>
            <Stack sx={{overflowY: "auto", minHeight: 0}}>
                {periods.map(([key, period], i) => {
                    const instances = [...(period.instances ?? [])].sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
                    return <Accordion key={`period-${key}`} defaultExpanded={i === 0} disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Stack sx={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                                width: "100%",
                                minWidth: 0,
                                pr: 1
                            }}>
                                <Typography sx={{fontWeight: 600}}>{period.identifier ?? key}</Typography>
                                <Typography variant={"caption"} color={"text.secondary"} sx={{whiteSpace: "nowrap"}}>
                                    {t("points.periods.windows", {count: instances.length})}
                                </Typography>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack sx={{gap: 2, minWidth: 0}}>
                                <Stack sx={{gap: 0.5}}>
                                    <Typography variant={"body2"}>
                                        <b>{t("points.details.validity")}:</b> {formatDate(period.start!)}
                                        {" "}&rarr;{" "}
                                        {period.end ? formatDate(period.end) : t("points.periods.open")}
                                    </Typography>
                                    <Typography variant={"body2"}>
                                        <b>{t("points.details.duration")}:</b> {formatMilliseconds(period.period ?? 0)}
                                    </Typography>
                                    <Typography variant={"body2"}>
                                        <b>{t("points.details.kept_instances")}:</b> {period.capacity}
                                    </Typography>
                                </Stack>
                                <TableContainer sx={{overflowX: "auto", maxWidth: "100%"}}>
                                    <Table size={"small"} sx={{"& td, & th": {whiteSpace: "nowrap"}}}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t("points.periods.window")}</TableCell>
                                                <TableCell>{t("points.form.start")}</TableCell>
                                                <TableCell>{t("points.form.end")}</TableCell>
                                                <TableCell align={"right"}>{t("points.periods.score")}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {instances.map(instance => (
                                                <TableRow key={`instance-${key}-${instance.start}`}>
                                                    <TableCell>{instance.index}</TableCell>
                                                    <TableCell>{formatDate(instance.start ?? 0)}</TableCell>
                                                    <TableCell>
                                                        {(instance.end ?? 0) > 0
                                                            ? formatDate(instance.end ?? 0)
                                                            : t("points.periods.open")}
                                                    </TableCell>
                                                    <TableCell align={"right"}>{instance.score ?? 0}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                })}
            </Stack>
        </Stack>
    </Dialog>

}
