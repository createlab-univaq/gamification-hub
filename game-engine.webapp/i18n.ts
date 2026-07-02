import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        backend:{
          loadPath:"/locales/{{lng}}/{{ns}}.json"
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
        ns:["errors", "commons", "buttons"],
        defaultNS: "commons",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    })
;
i18n.services.formatter.add("lowercase", (value)=>{
    return value.toLowerCase()
})
i18n.services.formatter.add("uppercase", (value)=>{
    return value.toUpperCase()
})
i18n.services.formatter.add("capitalize", (value)=>{
    return value && String(value[0]).toUpperCase() + String(value).slice(1)
})
export default i18n;