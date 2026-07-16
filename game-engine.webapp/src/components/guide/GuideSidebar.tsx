import {Box, Divider, List, ListItemButton, ListItemText, MenuItem, TextField, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

export interface GuideSection {
    slug: string
    title: string
}

interface GuideSidebarProps {
    sections: GuideSection[]
    activeSlug: string | null
    onSelect: (slug: string) => void
    compact: boolean
}

export function GuideSidebar({sections, activeSlug, onSelect, compact}: GuideSidebarProps) {
    const {t} = useTranslation()

    if (compact) {
        return <Box sx={{px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider"}}>
            <TextField
                select
                fullWidth
                size={"small"}
                label={t("guide.sections")}
                value={activeSlug ?? (sections[0]?.slug ?? "")}
                onChange={(e) => onSelect(e.target.value)}
            >
                {sections.map((section) => (
                    <MenuItem key={section.slug} value={section.slug}>{section.title}</MenuItem>
                ))}
            </TextField>
        </Box>
    }

    return <Box component={"nav"} sx={{
        width: 280,
        flexShrink: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflowY: "auto"
    }}>
        <Typography sx={{px: 2.5, pt: 2, display: "block", fontWeight:"bold"}}>
            {t("guide.sections")}
        </Typography>
        <Divider sx={{my:1}}/>
        <List sx={{px: 1}}>
            {sections.map((section) => {
                const selected = section.slug === activeSlug
                return <ListItemButton
                    key={section.slug}
                    selected={selected}
                    onClick={() => onSelect(section.slug)}
                    sx={{
                        borderRadius: 1,
                        borderLeft: "3px solid",
                        borderColor: selected ? "primary.main" : "transparent",
                        "&.Mui-selected": {backgroundColor: "action.selected"}
                    }}
                >
                    <ListItemText
                        primary={section.title}
                        slotProps={{
                            primary: {
                                variant: "body2",
                                sx: {fontWeight: selected ? 700 : 400, color: selected ? "primary.main" : "text.primary"}
                            }
                        }}
                    />
                </ListItemButton>
            })}
        </List>
    </Box>
}
