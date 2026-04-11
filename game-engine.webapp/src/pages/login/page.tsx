import {Button, Card, CardActions, CardContent, CardHeader, Stack, TextField, Typography} from "@mui/material";
import type {LoginRequest} from "../../api/types/types.ts";
import {useMutation} from "@tanstack/react-query";
import {authClient} from "../../api";
import {useNotificationContext} from "../../components/notification/NotificationProvider.tsx";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Form} from "../../components/form/Form.tsx";
import {FormInput} from "../../components/form/FormInput.tsx";
import {useForm} from "react-hook-form";
import {PasswordField} from "../../components/form/PasswordField.tsx";
import {router} from "../../router";

export function LoginPage() {

    const {setNotification} = useNotificationContext()
    const form = useForm<LoginRequest>({
        defaultValues: {
            username: "",
            password: ""
        }
    })
    const {mutate} = useMutation({
        mutationFn: (request) => authClient.login(request),
        onSuccess:()=>{
            router.navigate("/dashboard", {replace:true})
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

    return <Stack sx={{
        width: "100%",
        height: "100dvh",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <Card sx={{maxWidth: "30%"}}>
            <CardHeader>
                <Typography>Accedi</Typography>
            </CardHeader>
            <CardContent>
                <Form form={form} onSubmit={(fieldValues) => mutate({...fieldValues})}>
                    <Stack sx={{
                        gap: "2rem",
                        justifyContent: "center"
                    }}>
                        <Typography sx={{textAlign: "center"}} variant={"h4"}>Inserisci le tue credenziali</Typography>
                        <Stack sx={{
                            gap: "1rem"
                        }}>
                            <FormInput name={"username"}
                                       rules={{
                                           required: "Campo obbligatorio",
                                           pattern: {
                                               value: /^[a-zA-Z0-9_]+$/,
                                               message: "Lo username può contenere solo caratteri lettere e underscore."
                                           }
                                       }}>
                                <TextField type={"text"} label={"Username"} placeholder={"MyUsername"} fullWidth/>
                            </FormInput>
                            <FormInput name={"password"}
                                       rules={{
                                           required: "Password obbligatoria",
                                           pattern: {
                                               value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{4,}$/,
                                               message: "La password deve contenere almeno 4 caratteri, un carattere maiuscolo e minuscoolo, un numero ed un carattere speciale (@,$,!,%,*,?)"
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
                            <Button fullWidth={true} type={"submit"} variant={"contained"}>Accedi</Button>
                        </CardActions>
                    </Stack>
                </Form>
            </CardContent>
        </Card>
    </Stack>
}