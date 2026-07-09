import {type FieldValues, useForm} from "react-hook-form";
import {Form} from "./Form.tsx";
import type {LoginRequestDto, UserDto} from "../../api/types";
import {Box, Button, Stack, TextField, Typography} from "@mui/material";
import {FormInput} from "./FormInput.tsx";
import {PasswordField} from "./PasswordField.tsx";
import {useTranslation} from "react-i18next";
import {useMutation} from "@tanstack/react-query";
import {authClient, queryClient} from "../../api";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../notification/NotificationProvider.tsx";
import {navigateTo} from "../../utils/navigation-utils.ts";

export interface AuthFormValues extends FieldValues {
    username: string
    password: string
    confPassword: string
}

interface AuthFormProps {
    type: "signup" | "login" | "update"
}

export function AuthForm({type}: AuthFormProps) {

    const form = useForm<AuthFormValues>({
        defaultValues: {
            username: "",
            password: "",
            confPassword: ""
        }
    });

    const isLogin = type === "login";

    const {setNotification} = useNotificationContext()

    const {mutate} = useMutation<UserDto, object, LoginRequestDto>({
        mutationKey: ["signup-signin-request", type],
        mutationFn: (variables) => {
            if (isLogin) {
                return authClient.login(variables);
            }
            return authClient.register(variables);
        },
        onSuccess: () => {
            if (isLogin) {
                navigateTo("/dashboard", {
                    replace: true
                })
                return
            }
            queryClient.invalidateQueries({
                queryKey: ["signup-signin-request", type]
            })
            navigateTo("/login", {
                replace: true,
                state: {
                    type: "success",
                    title: t("signup.title"),
                    content: t("signup.message")
                }
            })
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

    const [t] = useTranslation();

    return <Form form={form} readonly={false}
                 onSubmit={(values) => mutate({username: values.username, password: values.password})}>
        <Stack sx={{
            gap: "2rem",
            justifyContent: "center"
        }}>
            <Typography sx={{textAlign: "center", textTransform: "uppercase"}}
                        variant={"h4"}>{isLogin ? t("login_title") : t("signup_title")}</Typography>
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
                {!isLogin &&
                    <FormInput name={"confPassword"}
                               rules={{
                                   required: t("required_field"),
                                   pattern: {
                                       value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{4,}$/,
                                       message: t("form.password_validation")
                                   },
                                   validate: (value, formValues) => {
                                       const password = formValues.password
                                       if (password === value) {
                                           return true
                                       }
                                       return t("form.password_not_matches")
                                   }
                               }}
                    >
                        <PasswordField label={t("confirm_password")} placeholder={"**********"} fullWidth/>
                    </FormInput>
                }
            </Stack>
            <Box sx={{
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"
            }}>
                <Button fullWidth={true} type={"submit"}
                        variant={"contained"}>
                    {isLogin ? t("buttons:sign_in") : t("buttons:confirm")}
                </Button>
            </Box>
        </Stack>
    </Form>

}