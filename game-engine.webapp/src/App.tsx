import './App.css'
import {RouterProvider} from "react-router-dom";
import {GameEngineUIThemeProvider} from "./theme/ThemeProvider.tsx";
import {router} from "./router";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient, setUnauthorizedHandler} from "./api";
import {NotificationProvider} from "./components/notification/NotificationProvider.tsx";
import {navigateTo} from "./utils/navigation-utils.ts";

setUnauthorizedHandler(() => {
    if (!window.location.pathname.startsWith("/login")) {
        const current = window.location.pathname;
        navigateTo(`/login?returnTo=${current}`);
    }
})

function App() {
    return <GameEngineUIThemeProvider>
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <RouterProvider router={router}/>
            </NotificationProvider>
        </QueryClientProvider>
    </GameEngineUIThemeProvider>
}

export default App
