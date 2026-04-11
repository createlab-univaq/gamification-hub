import {Card, Typography} from "@mui/material";
import {getCurrentUser} from "../../utils/auth-utils.ts";

export function DashboardPage() {

    const user = getCurrentUser()

    return <Card>
        <Typography>Accesso Autenticato: {user.username}</Typography>
    </Card>
}