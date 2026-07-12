import {useParams} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {Stack} from "@mui/material";
import {ActionForm} from "../../components/form/ActionForm.tsx";
import {useTranslation} from "react-i18next";
import {useGame} from "../../hooks/use-game";
import {Bolt, Games} from "@mui/icons-material";

export function ActionUpsertPage() {

    const game = useGame()
    const {actionName} = useParams()
    const [t] = useTranslation()

    return <PageContainer>
        <PageHeader
            title={actionName ? t("actions.update_title") : t("actions.upsert_title")}
            breadcrumbs={[
                {
                    icon: <Games/>,
                    label: t("sidebar.games"),
                    href: "/dashboard"
                },
                {
                    label: game.name ?? "My Game",
                    href: `/games/${game.id}`
                },
                {
                    label: t("sidebar.actions"),
                    href: `/games/${game.id}/actions`,
                    icon: <Bolt/>
                }
            ]}
        />
        <Stack sx={{marginTop: 3}}>
            <ActionForm gameId={game.id!} action={actionName}/>
        </Stack>
    </PageContainer>

}