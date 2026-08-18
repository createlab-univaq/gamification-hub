import type {ReactNode} from "react";
import {useState} from "react";
import {Box, IconButton} from "@mui/material";
import {Check, ContentCopy} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {nodeText} from "../../utils/guide-utils.ts";

// A fenced block with the means to take it away. There is no element that does this, so the button and
// the state that confirms it are ours: the confirmation is the whole point, as a copy that says nothing
// leaves the reader pressing it again to be sure.
export function CodeBlock({children}: { children?: ReactNode }) {
    const [t] = useTranslation()
    const [copied, setCopied] = useState(false)

    const copy = () => navigator.clipboard.writeText(nodeText(children))
        .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
        // No clipboard, on an insecure origin or with permission refused. The text stays selectable.
        .catch(() => undefined)

    return <Box sx={{position: "relative"}}>
        <IconButton size={"small"}
                    onClick={copy}
                    title={t("buttons:copy")}
                    aria-label={t("buttons:copy")}
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        // A box on the corner the rest of the application uses, rather than the circle an
                        // icon button draws by default.
                        borderRadius: 1,
                        p: 0.75,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.default",
                        "&:hover": {backgroundColor: "background.paper"}
                    }}>
            {copied ? <Check fontSize={"small"} color={"success"}/> : <ContentCopy fontSize={"small"}/>}
        </IconButton>
        <Box component={"pre"} sx={{
            my: 2.5,
            p: 2,
            pr: 6,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: (theme) => theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.35)" : "rgba(99, 51, 148, 0.05)",
            overflowX: "auto",
            fontSize: "0.82rem",
            lineHeight: 1.65,
            "& code": {
                fontFamily: "\"SFMono-Regular\", Menlo, Consolas, monospace",
                whiteSpace: "pre"
            }
        }}>{children}</Box>
    </Box>
}
