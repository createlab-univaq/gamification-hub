import {Button, Card, CardContent, Stack} from "@mui/material";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";
import {AuthForm} from "../../components/form/AuthForm.tsx";
import {useState} from "react";
import {useTranslation} from "react-i18next";

export function LoginPage() {

    const [type, setType] = useState<"signup" | "login">("login");
    const [t] = useTranslation();

    return <PageContainer>
        <Stack sx={{
            width: "100%",
            height: "100dvh",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <LanguageSelector defaultLanguage={"it"}/>
            <Card sx={{maxWidth: "30%", mt: 1}}>
                <CardContent>
                    <AuthForm type={type}/>
                    <Button
                        fullWidth={true}
                        variant="text"
                        color="primary"
                        onClick={() => {
                            setType(type === "signup" ? "login" : "signup");
                        }}
                        sx={{
                            mt:1
                        }}
                    >
                        {type === "login" ? t("buttons:goto_signup") : t("buttons:goto_login")}
                    </Button>
                </CardContent>
            </Card>
        </Stack>
    </PageContainer>
}