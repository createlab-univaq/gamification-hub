import {Navigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {logout} from "../../utils/auth-utils.ts";

export function LogoutPage() {
    const [done, setDone] = useState(false)

    useEffect(() => {
        logout().finally(() => setDone(true))
    }, []);

    if (done) {
        return <Navigate to={"/login"} replace={true}/>
    }
    return null
}
