import {DoneAll, Error as ErrorIcon, Warning} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import type {ExpectationVerdict} from "../../utils/simulation-utils.ts";

export function ExpectationStatus({verdict}: { verdict?: ExpectationVerdict }) {
    const [t] = useTranslation()

    if (!verdict) {
        return null
    }
    if (!verdict.found) {
        return <Warning color={"warning"} titleAccess={t("scenarios.form.test.missing.hint")}/>
    }
    if (verdict.passed) {
        return <DoneAll color={"success"}
                        titleAccess={t("scenarios.form.test.success.hint", {expected: verdict.expected})}/>
    }
    return <ErrorIcon color={"error"}
                      titleAccess={t("scenarios.form.test.error.hint", {
                          expected: verdict.expected,
                          actual: verdict.actual
                      })}/>
}
