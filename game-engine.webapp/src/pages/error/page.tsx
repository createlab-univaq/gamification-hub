import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Button, Stack, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

export function ErrorPage() {

    const [t] = useTranslation();

    return <PageContainer>
        <Stack sx={{
            alignItems:"center",
            justifyContent:"center",
            height:"80dvh",
            gap:"2rem"
        }}
        >
            <PageHeader title={<Typography variant={"h4"} sx={{textAlign:"center"}}>{t("error_page.title")}</Typography>}/>
            <Typography sx={{textAlign:"center"}}>{t("error_page.message")}</Typography>
            <Button href={"/dashboard"}>{t("buttons:turn_back")}</Button>
        </Stack>
    </PageContainer>
}