import {DroolEditor} from "../components/rule-builder/DroolEditor.tsx";
import {Button, Stack} from "@mui/material";
import {useState} from "react";

export function TestPage(){

    const [readonly, setReadonly] = useState(false)

    return <Stack>
        <DroolEditor onChange={(drl)=>console.log(drl)} readonly={readonly}/>
        <Button onClick={()=>setReadonly(!readonly)}>Readonly</Button>
    </Stack>

}