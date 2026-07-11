import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack, Typography} from "@mui/material";

export function ErrorPage() {
    return <PageContainer>
        <Stack sx={{
            alignItems:"center",
            justifyContent:"center",
            height:"80dvh",
            gap:"2rem"
        }}
        >
            <PageHeader title={"How did we get here?"}/>
            <Typography>Seems like the page you are trying to access doesn't exist!</Typography>
            <Typography>Click to go <a href={"/dashboard"}>back</a></Typography>
        </Stack>
    </PageContainer>
}