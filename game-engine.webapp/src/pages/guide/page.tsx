import {useQuery} from "@tanstack/react-query";
import {useTranslation} from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Box, Link as MuiLink, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {Loading} from "../../components/Loading.tsx";
import {docsClient} from "../../api";
import type {Language} from "../../utils/lng-utils.ts";
import {getCurrentUser} from "../../utils/auth-utils.ts";
import {getApiError, translateApiErrorToNotification} from "../../utils/error-utils.ts";
import {Navigate} from "react-router-dom";
import {PageContainer} from "../../components/layout/PageContainer.tsx";
import {PageHeader} from "../../components/layout/PageHeader.tsx";
import {ArrowBack} from "@mui/icons-material";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";

function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
    const rest: Record<string, unknown> = {...props}
    delete rest.node
    return rest as Omit<T, "node">
}

function cellAlign(align?: string | null) {
    return align === "left" || align === "right" || align === "center" ? align : undefined
}

export function GuidePage() {
    const {i18n, t} = useTranslation()
    const user = getCurrentUser()
    const {data, isLoading, error} = useQuery({
        queryKey: ["app-guide", i18n.language],
        queryFn: () => docsClient.getAppGuide(i18n.language as Language)
    })

    if (error) {
        const errorMessage = translateApiErrorToNotification(getApiError(error))
        return <Navigate to={user ? "/dashboard" : "/login"} replace={true} state={errorMessage}/>
    }

    return <PageContainer>
        <Stack direction="row" sx={{alignItems: "center", justifyContent: "space-between"}}>
            <PageHeader
                breadcrumbs={[
                    {
                        icon: <ArrowBack/>,
                        href: "/login",
                        label: t("buttons:turn_back")
                    }
                ]}
            />
            <LanguageSelector/>
        </Stack>
        <Box sx={{mx: "auto", px: 3, pb: 6, width: "100%"}}>
            {isLoading && <Loading fullScreen={false}/>}
            {data &&
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: (props) => <Typography variant={"h3"} sx={{mt: 2, mb: 2}} {...omitNode(props)}/>,
                        h2: (props) => <Typography variant={"h4"} sx={{mt: 4, mb: 2}} {...omitNode(props)}/>,
                        h3: (props) => <Typography variant={"h5"} sx={{mt: 3, mb: 1.5}} {...omitNode(props)}/>,
                        p: (props) => <Typography variant={"body1"} sx={{mb: 2}} {...omitNode(props)}/>,
                        li: (props) => <Typography component={"li"} variant={"body1"}
                                                   sx={{mb: 0.5}} {...omitNode(props)}/>,
                        table: (props) =>
                            <Box sx={{overflowX: "auto", mb: 3}}><Table size={"small"} {...omitNode(props)}/></Box>,
                        thead: (props) => <TableHead {...omitNode(props)}/>,
                        tbody: (props) => <TableBody {...omitNode(props)}/>,
                        tr: (props) => <TableRow {...omitNode(props)}/>,
                        th: ({align, ...props}) =>
                            <TableCell sx={{fontWeight: 600}} align={cellAlign(align)} {...omitNode(props)}/>,
                        td: ({align, ...props}) =>
                            <TableCell align={cellAlign(align)} {...omitNode(props)}/>,
                        a: ({href, ...props}) =>
                            <MuiLink href={href} target={href?.startsWith("http") ? "_blank" : undefined}
                                     rel={"noreferrer"} {...omitNode(props)}/>,
                        pre: (props) => <Box component={"pre"} sx={{overflow: "auto", my: 2}} {...omitNode(props)}/>,
                        code: (props) =>
                            <Box component={"code"} sx={{
                                bgcolor: "action.hover",
                                px: 0.6,
                                py: 0.2,
                                borderRadius: 0.5,
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                whiteSpace: "pre-wrap"
                            }} {...omitNode(props)}/>
                    }}
                >{data}</ReactMarkdown>
            }
        </Box>
    </PageContainer>

}
