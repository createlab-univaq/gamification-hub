import type {Language} from "../utils/lng-utils.ts";
import {type ReactNode} from "react";
import type {MenuItemProps} from "@mui/material";
import {MenuItem, Select} from "@mui/material";
import i18n from "../../i18n.ts";
import ReactCountryFlag from "react-country-flag";


interface LanguageSelectorProps {
    defaultLanguage?: Language
}

interface LanguageItemProps extends Omit<MenuItemProps, "children"> {
    code: string
    label: ReactNode
}

function getCountryCodeFromLanguage(lng: Language) {
    switch (lng) {
        case "it":
            return "it"
        case "en":
            return "gb"
        default:
            return "gb"
    }
}

function LanguageItem({code, label, ...props}: LanguageItemProps) {
    return <MenuItem sx={{flex: 1, alignItems: "center", justifyContent: "space-between", gap: 1}} {...props}>
        {label}
        <ReactCountryFlag countryCode={code} svg={true}/>
    </MenuItem>
}

export function LanguageSelector({defaultLanguage}: LanguageSelectorProps) {


    const lng = {
        lang: i18n.language ?? defaultLanguage,
        code: getCountryCodeFromLanguage((i18n.language as Language) ?? "en")
    }

    const handleChange = (lang: Language) => {
        i18n.changeLanguage(lang)
    }

    return <Select
        variant={"standard"}
        size={"small"}
        value={lng.lang}
        onChange={(e) => handleChange(e.target.value as Language)}
        MenuProps={{disableScrollLock: true}}
        sx={{
            "&:before": {
                borderBottom: "unset"
            }
        }}
        renderValue={(value) => {
            return <ReactCountryFlag
                countryCode={getCountryCodeFromLanguage(value as Language)}
                svg={true}
                style={{
                    width: "2rem"
                }}
            />
        }}
    >
        <LanguageItem value={"it"} code={"it"} label={"IT"}/>
        <LanguageItem value={"en"} code={"gb"} label={"EN"}/>
    </Select>

}