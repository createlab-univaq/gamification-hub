import {Box, Button, Stack, Typography} from "@mui/material";
import {AppIcon} from "../logo/AppIcon";
import {useTranslation} from "react-i18next";
import {AppLogo} from "../logo/AppLogo.tsx";

export function Footer() {

    const [t] = useTranslation()

    return <Stack component={"footer"} sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        scrollSnapAlign: "start",
        px: {xs: 3, sm: 6},
        pt: {xs: 5, sm: 6},
        pb: 3,
        gap: 4
    }}>
        <Stack direction={{xs: "column", sm: "row"}} sx={{
            justifyContent: "space-between",
            alignItems: {xs: "center", sm: "flex-start"},
            gap: 4,
            textAlign: {xs: "center", sm: "left"}
        }}>
            <Stack sx={{alignItems: {xs: "center", sm: "flex-start"}, gap: 1.5, maxWidth: 340}}>
                <Stack direction={{lg:"row", md:"row", sm:"row", xs:"column"}} sx={{alignItems: "center", gap: 1}}>
                    <AppIcon sx={{width: "4rem"}}/>
                    <AppLogo sx={{width: "16rem"}}/>
                </Stack>
                <Typography variant={"body2"} color={"text.secondary"}>
                    {t("landing.footer.tagline")}
                </Typography>
            </Stack>
            <Stack sx={{alignItems: {xs: "center", sm: "flex-start"}, gap: 1.5}}>
                <Stack sx={{alignItems: {xs: "center", sm: "flex-start"}, gap: 0.5}}>
                    <Typography variant={"subtitle2"} sx={{fontWeight: 700}}>
                        {t("landing.footer.linksTitle")}
                    </Typography>
                    <Box sx={{width: 32, height: 3, borderRadius: 2, backgroundColor: "primary.main"}}/>
                </Stack>
                <Stack sx={{alignItems: {xs: "center", sm: "flex-start"}, gap: 0.5}}>
                    <Button href={"https://createlab-univaq.it/"} size={"small"} variant={"text"}
                            sx={{color: "text.secondary", justifyContent: {xs: "center", sm: "flex-start"}}}>
                        {t("buttons:us")}
                    </Button>
                    <Button href={"/guide"} size={"small"} variant={"text"}
                            sx={{color: "text.secondary", justifyContent: {xs: "center", sm: "flex-start"}}}>
                        {t("sidebar.guide")}
                    </Button>
                    <Button href={"/login"} size={"small"} variant={"text"}
                            sx={{color: "text.secondary", justifyContent: {xs: "center", sm: "flex-start"}}}>
                        {t("buttons:sign_in")}
                    </Button>
                </Stack>
            </Stack>
        </Stack>
        <Stack direction={{xs: "column", sm: "row"}} sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider"
        }}>
            <Typography variant={"caption"} color={"text.secondary"}>
                {t("landing.footer.copyright", {year: new Date().getFullYear()})}
            </Typography>
            <Typography
                variant={"caption"}
                color={"text.secondary"}
                sx={{
                    textAlign: "center"
                }}
            >
                {t("landing.footer.department")}
            </Typography>
        </Stack>
    </Stack>
}