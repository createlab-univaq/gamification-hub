import dayjs from "dayjs";
import i18n from "./i18n";
dayjs.locale(i18n.language ?? "en");
export default dayjs;
