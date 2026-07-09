import {Button, Card, CardActions, CardContent, Stack, TextField, Typography} from "@mui/material";
import {useMutation} from "@tanstack/react-query";
import {authClient} from "../../api";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Form} from "../../components/form/Form.tsx";
import {FormInput} from "../../components/form/FormInput.tsx";
import {useForm} from "react-hook-form";
import {PasswordField} from "../../components/form/PasswordField.tsx";
import {router} from "../../router";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {useTranslation} from "react-i18next";
import type {LoginRequestDto} from "../../api/types";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";

export function LoginPage() {

    const {setNotification} = useNotificationContext()
    const {t} = useTranslation()
    const form = useForm<LoginRequestDto>({
        defaultValues: {
            username: "",
            password: ""
        }
    })
    const {mutate} = useMutation<unknown, object, LoginRequestDto>({
        mutationFn: (request) => authClient.login(request),
        onSuccess: () => {
            router.navigate("/dashboard", {replace: true})
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
            <Card sx={{maxWidth: "30%", mt:1}}>
                <CardContent>
                    <Form form={form} onSubmit={(fieldValues) => mutate(fieldValues as LoginRequestDto)}>
                        <Stack sx={{
                            gap: "2rem",
                            justifyContent: "center"
                        }}>
                            <Typography sx={{textAlign: "center", textTransform: "uppercase"}}
                                        variant={"h4"}>{t("login_title")}</Typography>
                            <Stack sx={{
                                gap: "1rem"
                            }}>
                                <FormInput name={"username"}
                                           rules={{
                                               required: t("required_field"),
                                               pattern: {
                                                   value: /^[a-zA-Z0-9_]+$/,
                                                   message: t("form.username_validation")
                                               }
                                           }}>
                                    <TextField type={"text"} label={"Username"} placeholder={"MyUsername"} fullWidth/>
                                </FormInput>
                                <FormInput name={"password"}
                                           rules={{
                                               required: t("required_field"),
                                               pattern: {
                                                   value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{4,}$/,
                                                   message: t("form.password_validation")
                                               }
                                           }}
                                >
                                    <PasswordField label={"Password"} placeholder={"**********"} fullWidth/>
                                </FormInput>
                            </Stack>
                            <CardActions sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "1rem"
                            }}>
                                <Button fullWidth={true} type={"submit"}
                                        variant={"contained"}>{t("buttons:sign_in")}</Button>
                            </CardActions>
                        </Stack>
                    </Form>
                </CardContent>
            </Card>
        </Stack>
    </PageContainer>
}