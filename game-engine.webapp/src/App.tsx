import './App.css'
import {RouterProvider} from "react-router-dom";
import {GameEngineUIThemeProvider} from "./theme/ThemeProvider.tsx";
import {router} from "./router";

function App() {
    return <GameEngineUIThemeProvider>
        <RouterProvider router={router}/>
    </GameEngineUIThemeProvider>
}

export default App
