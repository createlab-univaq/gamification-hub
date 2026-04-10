import {createBrowserRouter, Navigate} from "react-router-dom";
import {LoginPage} from "../pages/login/page.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to={"/login"}/>
    },
    {
        path: "/login",
        element: <LoginPage/>
    }
])