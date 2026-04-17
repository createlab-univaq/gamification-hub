import { Stack } from '@mui/material'
import { PageContainer } from '../../components/layout/PageContainer'
import { PageHeader } from '../../components/layout/PageHeader'
import { RuleBuilder } from '../../components/rule-builder/RuleBuilder'
import type { DroolsFile } from 'drools-builder'

export function RulesPage() {

    const handleSave = (file: DroolsFile, drl: string) => {
        // TODO: wire to API — file.rules[0] is the rule, file.imports are the imports
        console.log('file', file)
        console.log('drl', drl)
    }

    return (
        <PageContainer>
            <PageHeader title="Rule Builder" />
            <Stack sx={{ marginTop: 3 }}>
                <RuleBuilder onSave={handleSave} />
            </Stack>
        </PageContainer>
    )
}
