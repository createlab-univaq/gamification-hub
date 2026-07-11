import {Button, Card, CardContent, Stack} from "@mui/material";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";
import {AuthForm} from "../../components/form/AuthForm.tsx";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useSearchParams} from "react-router-dom";
import {useNotificationContext} from "../../hooks/use-notification-context.ts";
import {useMutation} from "@tanstack/react-query";
import type {LoginRequestDto, UserDto} from "../../api/types";
import {authClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";

export function LoginPage() {

    const [type, setType] = useState<"signup" | "login">("login");
    const [t] = useTranslation();
    const [params] = useSearchParams()
    const redirectTo = params.get("redirectTo") ?? "/dashboard";

    const {setNotification} = useNotificationContext()

    const {mutate} = useMutation<UserDto, object, LoginRequestDto>({
        mutationKey: ["signup-signin-request", type],
        mutationFn: (variables) => {
            if (type === "login") {
                return authClient.login(variables);
            } else if (type === "signup") {
                return authClient.register(variables);
            }
            return Promise.reject("Type not supported")
        },
        onSuccess: () => {
            if(type === "login") {
                navigateTo(redirectTo, {
                    replace: true
                })
                return
            }
            navigateTo("/login", {
                replace: true,
                state:{
                    type:"success",
                    content:t("signup.message"),
                    title:t("signup.title")
                }
            })
            setType("login")
        },
        onError: (error) => {
            console.error(error)
            const apiError = getApiError(error)
            setNotification({
                notification: translateApiErrorToNotification(apiError),
                isSnack: true
            })
        }
    })

    return <PageContainer>
        <Stack sx={{
            width: "100%",
            height: "100dvh",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <LanguageSelector defaultLanguage={"it"}/>
            <Card
                sx={{
                    maxWidth: {
                        lg: "30%",
                    },
                    mt: 1
                }}
            >
                <CardContent>
                    <AuthForm
                        type={type}
                        key={`form-${type}`}
                        onSubmit={(values) => {
                            mutate({username: values.username, password: values.password, origin: "WEBAPP"})
                        }}
                    />
                    <Button
                        fullWidth={true}
                        variant="text"
                        color="primary"
                        onClick={() => {
                            setType(type === "signup" ? "login" : "signup");
                        }}
                        sx={{
                            mt: 1
                        }}
                    >
                        {type === "login" ? t("buttons:goto_signup") : t("buttons:goto_login")}
                    </Button>
                </CardContent>
            </Card>
        </Stack>
    </PageContainer>
}