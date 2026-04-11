import {Navigate} from "react-router-dom";
import {logout} from "../../utils/auth-utils.ts";

export function LogoutPage() {
    logout()
    return <Navigate to={"/login"} replace={true}/>
}