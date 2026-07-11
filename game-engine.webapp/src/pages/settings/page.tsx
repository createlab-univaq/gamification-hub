import {getCurrentUser} from "../../utils/auth-utils.ts";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {useTranslation} from "react-i18next";
import {Button, Divider, Stack, TextField, Typography} from "@mui/material";
import {type AuthFormValues} from "../../components/form/AuthForm.tsx";
import {Games} from "@mui/icons-material";
import {useMutation} from "@tanstack/react-query";
import {authClient} from "../../api";
import {navigateTo} from "../../utils/navigation-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {useNotificationContext} from "../../hooks/use-notification-context";
import {DeleteDialog} from "../../components/DeleteDialog.tsx";
import {useState} from "react";
import {Form} from "../../components/form/Form.tsx";
import {useForm} from "react-hook-form";
import type {LoginRequestDto} from "../../api/types";
import {FormInput} from "../../components/form/FormInput.tsx";
import {PasswordField} from "../../components/form/PasswordField.tsx";

export function UserSettingsPage() {

    const user = getCurrentUser()
    const [t] = useTranslation()
    const {setNotification} = useNotificationContext()

    const form = useForm<AuthFormValues>({
        defaultValues: {
            username: user?.username ?? "",
            password: "",
            confPassword: ""
        }
    })

    const {mutate: updateUserMutation} = useMutation<unknown, object, LoginRequestDto>({
        mutationKey: ["update-user", user],
        mutationFn: async (value) => {
            await authClient.updateUser(value)
            return authClient.logout()
        },
        onSuccess: () => {
            navigateTo("/login", {
                replace: true,
                state: {
                    type: "success",
                    title: t("settings.form.success.title"),
                    content: t("settings.form.success.message")
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

    const {mutate: deactivateUserMutation} = useMutation<unknown, object, void>({
        mutationKey: ["deactivate-user", user],
        mutationFn: () => {
            return authClient.deactivateUser()
        },
        onSuccess: () => {
            navigateTo("/logout", {replace: true})
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

    const [deactivateModalOpen, setDeactivateModalOpen] = useState<boolean | undefined>(false);

    return <PageContainer>
        <PageHeader
            title={t("settings.title")}
            subTitle={t("settings.subtitle")}
            breadcrumbs={[
                {
                    icon: <Games/>,
                    label: t("sidebar.games"),
                    href: "/dashboard"
                },
            ]}
        />
        <DeleteDialog message={t("settings.deactivate_section.message")}
                      deleteFn={() => {
                          deactivateUserMutation()
                      }}
                      setElement={setDeactivateModalOpen}
                      element={deactivateModalOpen}
        />
        <Form form={form}
              onSubmit={(values) => updateUserMutation({...values} as LoginRequestDto)}>
            <Stack sx={{gap: 2, mt: 3}}>
                <Stack sx={{gap: 1}}>
                    <Typography variant={"h5"}>{t("settings.form.username")}</Typography>
                    <FormInput name={"username"} rules={{required: t("required_field")}}>
                        <TextField placeholder={"Username"} label={"Username"} fullWidth={true}/>
                    </FormInput>
                </Stack>
                <Stack sx={{gap: 1}}>
                    <Typography variant={"h5"}>{t("settings.form.password")}</Typography>
                    <FormInput name={"password"}
                               rules={{
                                   pattern: {
                                       value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{4,}$/,
                                       message: t("form.password_validation")
                                   }
                               }}
                    >
                        <PasswordField label={"Password"} placeholder={"**********"} fullWidth/>
                    </FormInput>
                    <FormInput name={"confPassword"}
                               rules={{
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
                    <Button
                        variant="contained"
                        type="submit"
                        sx={{
                            width: {
                                lg: "fit-content",
                                md: "fit-content"
                            }
                        }}
                    >
                        {t("buttons:confirm")}
                    </Button>
                </Stack>
                <Stack sx={{gap: 1}} divider={<Divider/>}>
                    <Typography variant={"h5"} color={"error"}>{t("settings.deactivate_section.title")}</Typography>
                    <Stack sx={{gap: 2}}>
                        <Typography>
                            {t("settings.deactivate_section.message")}
                        </Typography>
                        <Button
                            type="button"
                            color={"error"}
                            variant={"outlined"}
                            sx={{
                                width: {
                                    lg: "fit-content",
                                    md: "fit-content"
                                }
                            }}
                            onClick={() => {
                                setDeactivateModalOpen(true);
                            }}
                        >
                            {t("buttons:deactivate_account")}
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Form>
    </PageContainer>
}