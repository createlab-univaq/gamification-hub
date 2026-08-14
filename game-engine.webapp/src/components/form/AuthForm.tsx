import {type FieldValues, useForm} from "react-hook-form";
import {Form} from "./Form.tsx";
import {Box, Button, Stack, TextField, Typography} from "@mui/material";
import {FormInput} from "./FormInput.tsx";
import {PasswordField} from "./PasswordField.tsx";
import {useTranslation} from "react-i18next";

export interface AuthFormValues extends FieldValues {
    username: string
    password: string
    confPassword: string
}

interface AuthFormProps {
    type: "signup" | "login" | "update"
    onSubmit: (values: AuthFormValues) => void
}

export function AuthForm({type, onSubmit}: AuthFormProps) {

    const form = useForm<AuthFormValues>({
        defaultValues: {
            username: "",
            password: "",
            confPassword: ""
        }
    });

    const isLogin = type === "login";
    const [t] = useTranslation();

    return <Form form={form} readonly={false}
                 onSubmit={(values) => onSubmit(values as AuthFormValues)}>
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